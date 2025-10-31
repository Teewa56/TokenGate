'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import Dashboard from './components/Dashboard';

export default function Home() {
  const { publicKey } = useWallet();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <Header />
      {!publicKey ? <HeroSection /> : <Dashboard />}
    </div>
  );
}