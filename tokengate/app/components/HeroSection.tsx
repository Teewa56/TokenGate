'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function HeroSection() {
  return (
    <main className="relative max-w-7xl mx-auto px-4 py-20">
      {/* Animated background */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="text-center py-32 space-y-8 relative">
        <div className="space-y-4">
          <h2 className="text-6xl font-black bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Permissionless API Gateway
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Monetize your APIs with Solana. Token-gated access, on-chain billing, zero intermediaries.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <WalletMultiButton style={{ background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)', padding: '12px 24px', fontSize: '16px', fontWeight: 'bold' }} />
          <p className="text-sm text-slate-500">Connect your wallet to get started</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16">
          <FeatureCard icon="🔐" title="On-Chain Access" description="NFT ownership verified before each request" />
          <FeatureCard icon="💰" title="Instant Payments" description="Earnings settle directly to your wallet" />
          <FeatureCard icon="🚀" title="Zero Setup" description="Register API and start earning" />
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl border border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50 hover:border-slate-700 transition">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-bold mb-2">{title}</h3>
      <p className="text-sm text-slate-400">{description}</p>
    </div>
  );
}