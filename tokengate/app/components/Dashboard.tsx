'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import Link from 'next/link';
import Stats from './Stats';
import WalletButton from './WalletButton';

export default function Dashboard() {
  const { publicKey } = useWallet();

  return (
    <main className="relative max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/register" className="group relative p-6 rounded-xl border border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50 hover:border-purple-500/50 transition cursor-pointer overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition"></div>
              <div className="relative space-y-2">
                <h3 className="text-xl font-bold">Register API</h3>
                <p className="text-sm text-slate-400">Publish a new API and start monetizing</p>
                <div className="text-2xl pt-2">📤</div>
              </div>
            </Link>

            <Link href="/dashboard" className="group relative p-6 rounded-xl border border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50 hover:border-blue-500/50 transition cursor-pointer overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 opacity-0 group-hover:opacity-100 transition"></div>
              <div className="relative space-y-2">
                <h3 className="text-xl font-bold">My Dashboard</h3>
                <p className="text-sm text-slate-400">View your APIs and earnings</p>
                <div className="text-2xl pt-2">📊</div>
              </div>
            </Link>
          </div>

          <Stats walletAddress={publicKey?.toString() || ''} />
        </div>

        {/* Wallet Info */}
        <WalletButton />
      </div>
    </main>
  );
}