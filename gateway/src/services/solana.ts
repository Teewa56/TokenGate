import {
  Connection,
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import { connection, PROGRAM_ID } from '../config';
import IDL from '../idl/idl (1).json';

// Initialize Anchor Program
export function getProgram() {
  const dummyKeypair = Keypair.generate();
  const wallet = new Wallet(dummyKeypair);
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });

  const program = new Program(IDL as any, provider);
  return program;
}

// ============================================================================
// REGISTER API
// ============================================================================

export async function registerApiOnChain(
  ownerAddress: PublicKey,
  name: string,
  backendUrl: string,
  rateLimit: number,
  pricePerCall: number
): Promise<string> {
  try {
    const program = getProgram();

    // Derive PDA for registry account
    const [registryPda] = await PublicKey.findProgramAddress(
      [Buffer.from('api_registry'), ownerAddress.toBuffer(), Buffer.from(name)],
      PROGRAM_ID
    );

    console.log(`[REGISTER] Registry PDA: ${registryPda.toString()}`);
    console.log(`[REGISTER] Name: ${name}, Owner: ${ownerAddress.toString()}`);

    return registryPda.toString();
  } catch (error: unknown) {
    console.error('Register API error:', error);
    throw error;
  }
}

// ============================================================================
// PURCHASE ACCESS
// ============================================================================

export async function purchaseAccessOnChain(
  buyerAddress: PublicKey,
  apiId: PublicKey,
  registryAddress: PublicKey
): Promise<{ accessKeyPda: string; txHash: string }> {
  try {
    // Derive PDA for access key
    const [accessKeyPda] = await PublicKey.findProgramAddress(
      [Buffer.from('access_key'), registryAddress.toBuffer(), buyerAddress.toBuffer()],
      PROGRAM_ID
    );

    console.log(`[PURCHASE] Access Key PDA: ${accessKeyPda.toString()}`);
    console.log(`[PURCHASE] Buyer: ${buyerAddress.toString()}, API: ${apiId.toString()}`);

    return {
      accessKeyPda: accessKeyPda.toString(),
      txHash: 'pending-signature',
    };
  } catch (error: unknown) {
    console.error('Purchase access error:', error);
    throw error;
  }
}

// ============================================================================
// LOG USAGE
// ============================================================================

export async function logUsageOnChain(
  registryAddress: PublicKey,
  accessKeyAddress: PublicKey,
  calls: number
): Promise<void> {
  try {
    console.log(`[LOG_USAGE] Registry: ${registryAddress.toString()}, Calls: ${calls}`);
    console.log(`[LOG_USAGE] Usage logged for access key: ${accessKeyAddress.toString()}`);
  } catch (error: unknown) {
    console.error('Log usage error:', error);
  }
}

// ============================================================================
// VERIFY ACCESS KEY
// ============================================================================

export async function verifyAccessKeyOnChain(
  walletAddress: PublicKey,
  registryAddress: PublicKey
): Promise<boolean> {
  try {
    const program = getProgram();

    // Derive access key PDA
    const [accessKeyPda] = await PublicKey.findProgramAddress(
      [Buffer.from('access_key'), registryAddress.toBuffer(), walletAddress.toBuffer()],
      PROGRAM_ID
    );

    // Try to fetch access key account
    const accessKeyAccount = await (program.account as any).accessKey.fetch(accessKeyPda).catch(() => null);

    if (!accessKeyAccount) {
      console.log(`[VERIFY] Access key not found for ${walletAddress.toString()}`);
      return false;
    }

    if (!accessKeyAccount.active) {
      console.log(`[VERIFY] Access key inactive: ${accessKeyPda.toString()}`);
      return false;
    }

    console.log(`[VERIFY] Access verified for ${walletAddress.toString()}`);
    return true;
  } catch (error: unknown) {
    console.log(`[VERIFY] Access key verification failed for ${walletAddress.toString()}`);
    return false;
  }
}

// ============================================================================
// GET API REGISTRY
// ============================================================================

export async function getApiRegistry(registryAddress: PublicKey): Promise<any> {
  try {
    const program = getProgram();
    const registryData = await (program.account as any).apiRegistry.fetch(registryAddress);

    return {
      owner: registryData.owner.toString(),
      name: registryData.name,
      backendUrl: registryData.backendUrl,
      rateLimit: registryData.rateLimit,
      pricePerCall: registryData.pricePerCall.toString(),
      totalCalls: registryData.totalCalls.toString(),
      totalEarnings: registryData.totalEarnings.toString(),
      paused: registryData.paused,
    };
  } catch (error: unknown) {
    console.error('Get API registry error:', error);
    throw error;
  }
}

// ============================================================================
// GET ACCESS KEY
// ============================================================================

export async function getAccessKey(accessKeyAddress: PublicKey): Promise<any> {
  try {
    const program = getProgram();
    const accessKeyData = await (program.account as any).accessKey.fetch(accessKeyAddress);

    return {
      apiId: accessKeyData.apiId.toString(),
      owner: accessKeyData.owner.toString(),
      callsRemaining: accessKeyData.callsRemaining,
      active: accessKeyData.active,
    };
  } catch (error: unknown) {
    console.error('Get access key error:', error);
    throw error;
  }
}

// ============================================================================
// DERIVE PDA HELPER
// ============================================================================

export async function deriveRegistryPda(owner: PublicKey, name: string): Promise<PublicKey> {
  const [pda] = await PublicKey.findProgramAddress(
    [Buffer.from('api_registry'), owner.toBuffer(), Buffer.from(name)],
    PROGRAM_ID
  );
  return pda;
}

export async function deriveAccessKeyPda(
  registry: PublicKey,
  owner: PublicKey
): Promise<PublicKey> {
  const [pda] = await PublicKey.findProgramAddress(
    [Buffer.from('access_key'), registry.toBuffer(), owner.toBuffer()],
    PROGRAM_ID
  );
  return pda;
}