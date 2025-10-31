'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import Stats from '../../components/Stats';

export default function ApiDetailsPage() {
  const { publicKey } = useWallet();
  const params = useParams();
  const apiId = params.id as string;

  if (!publicKey) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400">Connect wallet first</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="text-xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            ← Back
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-black text-white mb-8">API Details: {apiId}</h1>
        <Stats walletAddress={publicKey.toString()} apiId={apiId} />
      </main>
    </div>
  );
}