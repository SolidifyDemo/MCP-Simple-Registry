'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRefresh = async () => {
    setRefreshing(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/v0.1/admin/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if you've set REGISTRY_ADMIN_KEY
          // 'Authorization': 'Bearer your_secret_key_here'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Cache refreshed successfully!');
      } else {
        setError(data.error || 'Failed to refresh cache');
      }
    } catch (err) {
      setError('Network error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Registry Admin</h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Cache Management</h2>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Clear the registry cache to force a refresh from external registries (npm, Docker Hub, GitHub).
            The next API request will fetch fresh data.
          </p>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            {refreshing ? 'Refreshing...' : 'Refresh Cache'}
          </button>

          {message && (
            <div className="mt-4 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded">
              {error}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Configuration</h2>
          
          <div className="space-y-4 text-sm">
            <div>
              <span className="font-semibold">Registry Fetching:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-300">
                {process.env.NEXT_PUBLIC_ENABLE_REGISTRY_FETCHING !== 'false' ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            
            <div>
              <span className="font-semibold">Cache Duration:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-300">
                {process.env.NEXT_PUBLIC_CACHE_DURATION || '3600000'}ms (1 hour)
              </span>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400 text-xs">
                To modify these settings, update your <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">.env.local</code> file.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Link 
            href="/"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
          >
            ← Back to Registry
          </Link>
        </div>
      </main>
    </div>
  );
}
