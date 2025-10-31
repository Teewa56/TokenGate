'use client';

import { useEffect, useState } from 'react';

interface KeyListProps {
  walletAddress: string;
}

export default function KeyList({ walletAddress }: KeyListProps) {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // TODO: Fetch API keys from backend
    setLoading(false);
  }, [walletAddress]);

  return (
    <div className="p-6 rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950">
      <h3 className="text-2xl font-bold mb-6">API Access Keys</h3>

      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : keys.length === 0 ? (
        <p className="text-slate-400">No API keys yet</p>
      ) : (
        <div className="space-y-3">
          {keys.map((key: any) => (
            <div key={key.id} className="p-4 bg-slate-800 rounded border border-slate-700">
              <p className="font-mono text-sm text-purple-400">{key.id}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
