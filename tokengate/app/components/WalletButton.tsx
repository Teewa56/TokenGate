'use client';

import { useWallet } from '@solana/wallet-adapter-react';

export default function WalletButton() {
  const { publicKey } = useWallet();

  return (
    <div className="p-6 rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 h-fit">
      <h3 className="text-lg font-bold mb-4">Connected Wallet</h3>
      <div className="space-y-3">
        <div className="p-3 bg-slate-900/50 rounded border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Address</p>
          <p className="text-sm font-mono break-all text-purple-400">
            {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
          </p>
        </div>
        <button
          onClick={() => navigator.clipboard.writeText(publicKey?.toString() || '')}
          className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition"
        >
          Copy Address
        </button>
      </div>
    </div>
  );
}