'use client';

import { useState } from 'react';

interface APIFormProps {
  walletAddress: string;
}

export default function APIForm({ walletAddress }: APIFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    backendUrl: '',
    rateLimit: 100,
    pricePerCall: 5000,
    owner: walletAddress,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [apiId, setApiId] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rateLimit' || name === 'pricePerCall' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_GATEWAY_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Wallet': walletAddress,
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      const result = await response.json();
      setApiId(result.apiId);
      setMessage({ type: 'success', text: 'API registered successfully!' });
      setFormData({ name: '', backendUrl: '', rateLimit: 100, pricePerCall: 5000, owner: walletAddress });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950">
      <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
        Register Your API
      </h1>
      <p className="text-slate-400 mb-8">Publish your API and start earning immediately</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">API Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="My Weather API"
            required
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Backend URL</label>
          <input
            type="url"
            name="backendUrl"
            value={formData.backendUrl}
            onChange={handleChange}
            placeholder="https://api.example.com"
            required
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Rate Limit (req/min)</label>
            <input
              type="number"
              name="rateLimit"
              value={formData.rateLimit}
              onChange={handleChange}
              min="1"
              required
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Price (lamports)</label>
            <input
              type="number"
              name="pricePerCall"
              value={formData.pricePerCall}
              onChange={handleChange}
              min="0"
              required
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-bold rounded-lg transition"
        >
          {loading ? 'Registering...' : 'Register API'}
        </button>
      </form>

      {message && (
        <div
          className={`mt-6 p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-950/50 border-green-800 text-green-200'
              : 'bg-red-950/50 border-red-800 text-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {apiId && (
        <div className="mt-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
          <p className="text-sm text-slate-400 mb-2">Your API ID:</p>
          <p className="text-white font-mono text-sm break-all bg-slate-900 p-3 rounded mb-2">{apiId}</p>
          <button
            onClick={() => navigator.clipboard.writeText(apiId)}
            className="text-purple-400 hover:text-purple-300 text-sm font-semibold"
          >
            📋 Copy to clipboard
          </button>
        </div>
      )}
    </div>
  );
}
