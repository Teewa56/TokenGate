import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';

export function useSolana() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const getBalance = async (address: PublicKey) => {
    const balance = await connection.getBalance(address);
    return balance;
  };

  const sendTx = async (transaction: Transaction) => {
    if (!publicKey) throw new Error('Wallet not connected');
    const signature = await sendTransaction(transaction, connection);
    return signature;
  };

  return { connection, publicKey, getBalance, sendTx };
}