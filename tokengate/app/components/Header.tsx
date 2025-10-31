'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Header() {
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center font-bold">
            TG
          </div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            TokenGate
          </h1>
        </Link>
        {mounted && <WalletMultiButton style={{ background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)' }} />}
      </div>
    </header>
  );
}