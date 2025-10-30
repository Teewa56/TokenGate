import { Connection, PublicKey } from '@solana/web3.js';
import dotenv from 'dotenv';

dotenv.config();

export const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
export const PROGRAM_ID = new PublicKey("HRhuJDBenXrraLRfEQpFxNKkMBDbBXmjfKguyFGsxrAL");
export const PORT = process.env.PORT || 3001;
export const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

export const connection = new Connection(RPC_URL, 'confirmed');