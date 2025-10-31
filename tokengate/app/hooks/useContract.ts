import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

export function useContract() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID || '');

  const registerAPI = async (name: string, backendUrl: string, rateLimit: number, pricePerCall: number) => {
    // TODO: Implement contract call
    console.log('Registering API on-chain');
  };

  const purchaseAccess = async (apiId: string) => {
    // TODO: Implement contract call
    console.log('Purchasing access on-chain');
  };

  return { PROGRAM_ID, registerAPI, purchaseAccess };
}