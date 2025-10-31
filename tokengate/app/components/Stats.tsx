'use client';

import { useEffect, useState } from 'react';

interface StatsProps {
  walletAddress: string;
  apiId?: string;
}

export default function Stats({ walletAddress, apiId }: StatsProps) {
  const [stats, setStats] = useState({
    totalApis: 0,
    totalEarnings: 0,
    totalCalls: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch stats from backend
    setLoading(false);
  }, [walletAddress, apiId]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-6 rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950">
        <p className="text-sm text-slate-400 mb-2">Total APIs</p>
        <p className="text-4xl font-bold text-purple-400">{stats.totalApis}</p>
      </div>

      <div className="p-6 rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950">
        <p className="text-sm text-slate-400 mb-2">Earnings</p>
        <p className="text-4xl font-bold text-blue-400">◎ {stats.totalEarnings}</p>
      </div>

      <div className="p-6 rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950">
        <p className="text-sm text-slate-400 mb-2">Total Calls</p>
        <p className="text-4xl font-bold text-cyan-400">{stats.totalCalls}</p>
      </div>
    </div>
  );
}
