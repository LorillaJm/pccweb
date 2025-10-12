'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export default function OnlineStatus() {
  const { isOnline } = usePWA();
  const [showStatus, setShowStatus] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowStatus(true);
      setWasOffline(true);
    } else if (wasOffline) {
      // Show "back online" message briefly
      setShowStatus(true);
      const timer = setTimeout(() => {
        setShowStatus(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (!showStatus) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg ${
          isOnline
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
        }`}
      >
        {isOnline ? (
          <>
            <Wifi className="w-5 h-5" />
            <span className="text-sm font-medium">Back online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-5 h-5" />
            <span className="text-sm font-medium">You're offline</span>
          </>
        )}
      </div>
    </div>
  );
}
