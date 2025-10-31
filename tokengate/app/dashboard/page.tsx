'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import Link from 'next/link';
import Stats from '../components/Stats';
import KeyList from '../components/KeyList';

export default function DashboardPage() {
  const { publicKey } = useWallet();

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

      <main className="max-w-7xl mx-auto px-4 py-12 space-y-8">
        <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          My Dashboard
        </h1>
        <Stats walletAddress={publicKey.toString()} />
        <KeyList walletAddress={publicKey.toString()} />
      </main>
    </div>
  );
}