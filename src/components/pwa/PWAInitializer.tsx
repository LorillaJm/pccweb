'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/pwa';

export default function PWAInitializer() {
  useEffect(() => {
    // Register service worker on mount
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      registerServiceWorker();
    }
  }, []);

  return null;
}
