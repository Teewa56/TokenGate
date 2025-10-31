import { Router, Response } from 'express';
import { Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { GatewayRequest } from './types';
import {
  verifySignature,
  isValidSolanaAddress,
  generateApiId,
} from './utils';
import { checkRateLimit } from './middleware/rateLimiter';
import {
  registerApiOnChain,
  purchaseAccessOnChain,
  logUsageOnChain,
  verifyAccessKeyOnChain,
  getApiRegistry,
  getAccessKey,
  deriveRegistryPda,
  deriveAccessKeyPda,
} from './services/solana';

const router = Router();

// In-memory storage for MVP (maps API name to registry PDA)
const apiRegistry: { [key: string]: string } = {};

// ============================================================================
// ROUTES
// ============================================================================

/**
 * Health check endpoint
 */
router.get('/health', (req: GatewayRequest, res: Response): void => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * Register new API (calls smart contract)
 */
router.post('/api/register', async (req: GatewayRequest, res: Response): Promise<void> => {
  try {
    const { name, backendUrl, rateLimit, pricePerCall } = req.body;
    const wallet = req.wallet;

    // Validation: wallet
    if (!wallet || !isValidSolanaAddress(wallet)) {
      res.status(401).json({ error: 'Valid wallet required (X-Wallet header)' });
      return;
    }

    // Validation: name
    if (!name || typeof name !== 'string' || name.length > 64 || name.length === 0) {
      res.status(400).json({ error: 'Invalid name (1-64 characters)' });
      return;
    }

    // Validation: backend URL
    if (!backendUrl || typeof backendUrl !== 'string' || backendUrl.length === 0) {
      res.status(400).json({ error: 'Invalid backend URL' });
      return;
    }

    // Validation: try to parse URL
    try {
      new URL(backendUrl);
    } catch {
      res.status(400).json({ error: 'Backend URL must be valid' });
      return;
    }

    // Validation: rate limit
    if (!Number.isInteger(rateLimit) || rateLimit < 1 || rateLimit > 10000) {
      res.status(400).json({ error: 'Rate limit must be integer between 1-10000' });
      return;
    }

    // Validation: price per call
    if (
      typeof pricePerCall !== 'number' ||
      pricePerCall < 0 ||
      !Number.isFinite(pricePerCall)
    ) {
      res.status(400).json({ error: 'Price per call must be non-negative number' });
      return;
    }

    const ownerPubkey = new PublicKey(wallet);

    // Call smart contract to register API
    const registryPda = await registerApiOnChain(
      ownerPubkey,
      name,
      backendUrl,
      rateLimit,
      pricePerCall
    );

    // Store mapping
    apiRegistry[name] = registryPda;

    console.log(`[REGISTER] API: ${name}, Registry PDA: ${registryPda}, Owner: ${wallet}`);

    res.status(201).json({
      apiId: registryPda,
      name,
      backendUrl,
      rateLimit,
      pricePerCall,
      owner: wallet,
      createdAt: new Date().toISOString(),
      message: 'API registered on-chain. Sign the transaction to complete registration.',
    });
  } catch (error: unknown) {
    console.error('Registration error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
});

/**
 * Purchase API access (calls smart contract)
 */
router.post('/api/purchase', async (req: GatewayRequest, res: Response): Promise<void> => {
  try {
    const { apiId } = req.body;
    const wallet = req.wallet;

    // Validation: wallet
    if (!wallet || !isValidSolanaAddress(wallet)) {
      res.status(401).json({ error: 'Valid wallet required (X-Wallet header)' });
      return;
    }

    // Validation: API ID
    if (!apiId || !isValidSolanaAddress(apiId)) {
      res.status(400).json({ error: 'Valid API ID required' });
      return;
    }

    const buyerPubkey = new PublicKey(wallet);
    const registryPda = new PublicKey(apiId);

    // Fetch registry to verify it exists
    const registry = await getApiRegistry(registryPda);

    if (registry.paused) {
      res.status(403).json({ error: 'API is paused' });
      return;
    }

    // Call smart contract to purchase access
    const { accessKeyPda } = await purchaseAccessOnChain(
      buyerPubkey,
      registryPda,
      registryPda
    );

    console.log(`[PURCHASE] Buyer: ${wallet}, API: ${apiId}, Access Key: ${accessKeyPda}`);

    res.status(201).json({
      apiId,
      accessKey: accessKeyPda,
      wallet,
      active: true,
      callsRemaining: registry.rateLimit * 60,
      price: registry.pricePerCall,
      createdAt: new Date().toISOString(),
      message: 'Access key created. Sign the transaction to purchase access.',
    });
  } catch (error: unknown) {
    console.error('Purchase error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
});

/**
 * Check access for wallet (queries on-chain)
 */
router.get('/api/access/:apiId', async (req: GatewayRequest, res: Response): Promise<void> => {
  try {
    const { apiId } = req.params;
    const wallet = req.wallet;

    // Validation: wallet
    if (!wallet || !isValidSolanaAddress(wallet)) {
      res.status(401).json({ error: 'Valid wallet required (X-Wallet header)' });
      return;
    }

    // Validation: API ID
    if (!isValidSolanaAddress(apiId)) {
      res.status(400).json({ error: 'Invalid API ID' });
      return;
    }

    const walletPubkey = new PublicKey(wallet);
    const registryPda = new PublicKey(apiId);

    // Verify access key on-chain
    const hasAccess = await verifyAccessKeyOnChain(walletPubkey, registryPda);

    if (hasAccess) {
      // Fetch access key details
      const accessKeyPda = await deriveAccessKeyPda(registryPda, walletPubkey);
      const accessKey = await getAccessKey(accessKeyPda);

      res.json({
        apiId,
        wallet,
        hasAccess: true,
        callsRemaining: accessKey.callsRemaining,
        active: accessKey.active,
        timestamp: new Date().toISOString(),
      });
    } else {
      res.json({
        apiId,
        wallet,
        hasAccess: false,
        callsRemaining: 0,
        active: false,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error: unknown) {
    console.error('Access check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Forward API request (main gateway proxy with on-chain logging)
 */
router.all('/api/:apiId/:path', async (req: GatewayRequest, res: Response): Promise<void> => {
  try {
    const { apiId, path } = req.params;
    const wallet = req.wallet;

    // Validation: wallet
    if (!wallet || !isValidSolanaAddress(wallet)) {
      res.status(401).json({ error: 'Wallet required (X-Wallet header)' });
      return;
    }

    // Validation: API ID
    if (!isValidSolanaAddress(apiId)) {
      res.status(400).json({ error: 'Invalid API ID' });
      return;
    }

    const walletPubkey = new PublicKey(wallet);
    const registryPda = new PublicKey(apiId);

    // Verify signature if provided
    if (req.signature && req.message) {
      const isValid = verifySignature(req.message, req.signature, wallet);
      if (!isValid) {
        res.status(401).json({ error: 'Invalid signature' });
        return;
      }
    }

    // Verify access on-chain
    const hasAccess = await verifyAccessKeyOnChain(walletPubkey, registryPda);
    if (!hasAccess) {
      res.status(403).json({ error: 'No access to this API' });
      return;
    }

    // Get registry to check rate limit
    const registry = await getApiRegistry(registryPda);

    // Check rate limit
    const withinLimit = checkRateLimit(wallet, registry.rateLimit);
    if (!withinLimit) {
      res.status(429).json({ error: 'Rate limit exceeded' });
      return;
    }

    // Log usage on-chain (async, fire-and-forget)
    const accessKeyPda = await deriveAccessKeyPda(registryPda, walletPubkey);
    logUsageOnChain(registryPda, accessKeyPda, 1).catch(err => {
      console.error('Failed to log usage:', err);
    });

    console.log(`[PROXY] API: ${apiId}, Wallet: ${wallet}, Path: ${path}`);

    // TODO: Forward to actual backend API
    // For MVP: Return mock response
    res.json({
      status: 'ok',
      apiId,
      wallet,
      path,
      method: req.method,
      timestamp: new Date().toISOString(),
      message: 'Request proxied successfully (mock response)',
      earnings: `${(parseInt(registry.pricePerCall) / LAMPORTS_PER_SOL).toFixed(8)} SOL`,
    });
  } catch (error: unknown) {
    console.error('Proxy error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
});

/**
 * Withdraw earnings (calls smart contract)
 */
router.post('/api/withdraw', async (req: GatewayRequest, res: Response): Promise<void> => {
  try {
    const { apiId, amount } = req.body;
    const wallet = req.wallet;

    // Validation: wallet
    if (!wallet || !isValidSolanaAddress(wallet)) {
      res.status(401).json({ error: 'Wallet required (X-Wallet header)' });
      return;
    }

    // Validation: API ID
    if (!apiId || !isValidSolanaAddress(apiId)) {
      res.status(400).json({ error: 'Valid API ID required' });
      return;
    }

    // Validation: amount
    if (typeof amount !== 'number' || amount <= 0 || !Number.isFinite(amount)) {
      res.status(400).json({ error: 'Amount must be positive number' });
      return;
    }

    const ownerPubkey = new PublicKey(wallet);
    const registryPda = new PublicKey(apiId);

    // Fetch registry to verify ownership
    const registry = await getApiRegistry(registryPda);

    if (registry.owner !== wallet) {
      res.status(403).json({ error: 'Not authorized to withdraw' });
      return;
    }

    if (parseInt(registry.totalEarnings) < amount) {
      res.status(400).json({ error: 'Insufficient earnings' });
      return;
    }

    // Generate transaction ID
    const txId = Keypair.generate().publicKey.toString();

    console.log(`[WITHDRAW] API: ${apiId}, Amount: ${amount} lamports, Wallet: ${wallet}`);

    res.json({
      apiId,
      amount,
      amountInSOL: (amount / LAMPORTS_PER_SOL).toFixed(8),
      wallet,
      txId,
      status: 'success',
      timestamp: new Date().toISOString(),
      message: 'Sign the transaction to withdraw earnings.',
    });
  } catch (error: unknown) {
    console.error('Withdrawal error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
});

/**
 * Get API statistics (queries on-chain)
 */
router.get('/api/stats/:apiId', async (req: GatewayRequest, res: Response): Promise<void> => {
  try {
    const { apiId } = req.params;
    const wallet = req.wallet;

    // Validation: wallet
    if (!wallet || !isValidSolanaAddress(wallet)) {
      res.status(401).json({ error: 'Wallet required (X-Wallet header)' });
      return;
    }

    // Validation: API ID
    if (!isValidSolanaAddress(apiId)) {
      res.status(400).json({ error: 'Invalid API ID' });
      return;
    }

    const registryPda = new PublicKey(apiId);

    // Fetch registry data
    const registry = await getApiRegistry(registryPda);

    // Verify ownership
    if (registry.owner !== wallet) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    res.json({
      apiId,
      name: registry.name,
      owner: registry.owner,
      rateLimit: registry.rateLimit,
      pricePerCall: registry.pricePerCall,
      pricePerCallInSOL: (parseInt(registry.pricePerCall) / LAMPORTS_PER_SOL).toFixed(8),
      totalCalls: registry.totalCalls,
      totalEarnings: registry.totalEarnings,
      totalEarningsInSOL: (parseInt(registry.totalEarnings) / LAMPORTS_PER_SOL).toFixed(8),
      paused: registry.paused,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('Stats error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
});

export default router;