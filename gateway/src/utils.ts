import { PublicKey, Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import nacl from 'tweetnacl';

/**
 * Verify wallet signature using Ed25519
 */
export function verifySignature(message: string, signature: string, wallet: string): boolean {
  try {
    const messageBytes = Buffer.from(message, 'utf8');
    const signatureBytes: Uint8Array = bs58.decode(signature);
    const walletPubkey = new PublicKey(wallet);
    const walletBytes = walletPubkey.toBytes();

    // Verify ed25519 signature
    const isValid = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      walletBytes
    );

    return isValid;
  } catch (error: unknown) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Check if wallet owns access key (query blockchain)
 */
export async function checkAccess(wallet: string, apiId: string): Promise<boolean> {
  try {
    const walletPubkey = new PublicKey(wallet);
    const apiIdPubkey = new PublicKey(apiId);

    if (!walletPubkey || !apiIdPubkey) {
      return false;
    }

    // TODO: In production: Query AccessKey PDA account on-chain
    // For MVP: Accept any valid wallet
    return true;
  } catch (error: unknown) {
    console.error('Access check error:', error);
    return false;
  }
}

/**
 * Log usage to contract (async operation)
 */
export async function logUsageOnChain(
  apiId: string,
  wallet: string,
  calls: number
): Promise<void> {
  try {
    // TODO: In production: Call contract's log_usage instruction
    // For MVP: Log to console
    console.log(
      `[USAGE LOG] API: ${apiId}, Wallet: ${wallet}, Calls: ${calls}, Time: ${new Date().toISOString()}`
    );
  } catch (error: unknown) {
    console.error('Error logging usage:', error);
  }
}

/**
 * Validate Solana address format
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate unique API ID
 */
export function generateApiId(): string {
  return Keypair.generate().publicKey.toString();
}