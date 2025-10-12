'use client';

import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <WifiOff className="w-24 h-24 mx-auto text-gray-400" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          You're Offline
        </h1>
        
        <p className="text-gray-600 mb-8">
          It looks like you've lost your internet connection. Some features may not be available until you're back online.
        </p>

        {isOnline ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 font-medium">
              Connection restored! You can now reload the page.
            </p>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">
              Check your internet connection and try again.
            </p>
          </div>
        )}

        <button
          onClick={handleRetry}
          disabled={!isOnline}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
          Retry Connection
        </button>

        <div className="mt-8 text-sm text-gray-500">
          <p>While offline, you can still:</p>
          <ul className="mt-2 space-y-1">
            <li>• View your digital ID</li>
            <li>• Access cached event tickets</li>
            <li>• Browse previously loaded content</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
