import { Router, Response } from 'express';
import { Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { GatewayRequest } from './types';
import {
  verifySignature,
  checkAccess,
  logUsageOnChain,
  isValidSolanaAddress,
  generateApiId,
} from './utils';
import { checkRateLimit } from './middleware/rateLimiter';

const router = Router();

// ============================================================================
// TYPES
// ============================================================================

interface ApiRegistration {
  [key: string]: {
    name: string;
    backendUrl: string;
    rateLimit: number;
    pricePerCall: number;
    owner: string;
    createdAt: string;
  };
}

// In-memory storage for MVP
const apiRegistry: ApiRegistration = {};

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
 * Register new API
 */
router.post('/register', (req: GatewayRequest, res: Response): void => {
  try {
    const { name, backendUrl, rateLimit, pricePerCall, owner } = req.body;

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

    // Validation: owner (wallet address)
    if (!owner || !isValidSolanaAddress(owner)) {
      res.status(400).json({ error: 'Invalid owner wallet address' });
      return;
    }

    // Generate API ID
    const apiId = generateApiId();

    // Store in registry
    apiRegistry[apiId] = {
      name,
      backendUrl,
      rateLimit,
      pricePerCall,
      owner,
      createdAt: new Date().toISOString(),
    };

    console.log(`[REGISTER] API: ${name}, ID: ${apiId}, Owner: ${owner}`);

    res.status(201).json({
      apiId,
      name,
      backendUrl,
      rateLimit,
      pricePerCall,
      owner,
      createdAt: apiRegistry[apiId].createdAt,
    });
  } catch (error: unknown) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Purchase API access
 */
router.post('/purchase', async (req: GatewayRequest, res: Response): Promise<void> => {
  try {
    const { apiId } = req.body;
    const wallet = req.wallet;

    // Validation: wallet header
    if (!wallet || !isValidSolanaAddress(wallet)) {
      res.status(401).json({ error: 'Valid wallet required (X-Wallet header)' });
      return;
    }

    // Validation: API ID
    if (!apiId || !isValidSolanaAddress(apiId)) {
      res.status(400).json({ error: 'Valid API ID required' });
      return;
    }

    // Check if API exists
    if (!apiRegistry[apiId]) {
      res.status(404).json({ error: 'API not found' });
      return;
    }

    // Generate access key
    const accessKey = Keypair.generate().publicKey.toString();

    console.log(`[PURCHASE] Wallet: ${wallet}, API: ${apiId}, Key: ${accessKey}`);

    res.status(201).json({
      apiId,
      wallet,
      accessKey,
      active: true,
      callsRemaining: apiRegistry[apiId].rateLimit * 60,
      createdAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('Purchase error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Check access for wallet
 */
router.get('/access/:apiId', async (req: GatewayRequest, res: Response): Promise<void> => {
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

    // Check if API exists
    if (!apiRegistry[apiId]) {
      res.status(404).json({ error: 'API not found' });
      return;
    }

    // Check access
    const hasAccess = await checkAccess(wallet, apiId);

    res.json({
      apiId,
      wallet,
      hasAccess,
      rateLimitRemaining: 60,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('Access check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Forward API request (main gateway proxy)
 */
router.all('/api/:apiId', async (req: GatewayRequest, res: Response): Promise<void> => {
  try {
    const { apiId } = req.params;
    const path: string = (req.params as Record<string, string>)[0] || '';
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

    // Check API exists
    if (!apiRegistry[apiId]) {
      res.status(404).json({ error: 'API not found' });
      return;
    }

    // Verify signature if provided
    if (req.signature && req.message) {
      const isValid = verifySignature(req.message, req.signature, wallet);
      if (!isValid) {
        res.status(401).json({ error: 'Invalid signature' });
        return;
      }
    }

    // Check access
    const hasAccess = await checkAccess(wallet, apiId);
    if (!hasAccess) {
      res.status(403).json({ error: 'No access to this API' });
      return;
    }

    // Check rate limit
    const withinLimit = checkRateLimit(wallet, apiRegistry[apiId].rateLimit);
    if (!withinLimit) {
      res.status(429).json({ error: 'Rate limit exceeded' });
      return;
    }

    // Log usage
    await logUsageOnChain(apiId, wallet, 1);

    // TODO: In production, forward to actual backend
    // For MVP: Return mock response
    res.json({
      status: 'ok',
      apiId,
      wallet,
      path,
      method: req.method,
      timestamp: new Date().toISOString(),
      message: 'Request proxied successfully',
    });
  } catch (error: unknown) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Withdraw earnings
 */
router.post('/withdraw', (req: GatewayRequest, res: Response): void => {
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

    // Check API exists
    if (!apiRegistry[apiId]) {
      res.status(404).json({ error: 'API not found' });
      return;
    }

    // Check ownership
    if (apiRegistry[apiId].owner !== wallet) {
      res.status(403).json({ error: 'Not authorized to withdraw' });
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
    });
  } catch (error: unknown) {
    console.error('Withdrawal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get API statistics
 */
router.get('/stats/:apiId', async (req: GatewayRequest, res: Response): Promise<void> => {
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

    // Check API exists
    if (!apiRegistry[apiId]) {
      res.status(404).json({ error: 'API not found' });
      return;
    }

    // Check ownership
    if (apiRegistry[apiId].owner !== wallet) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const api = apiRegistry[apiId];

    // TODO: In production, query contract for real stats
    res.json({
      apiId,
      name: api.name,
      owner: api.owner,
      rateLimit: api.rateLimit,
      pricePerCall: api.pricePerCall,
      totalCalls: 1250,
      totalEarnings: 6250000,
      activeKeys: 42,
      createdAt: api.createdAt,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;