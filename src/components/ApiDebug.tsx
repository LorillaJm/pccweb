'use client';

import { useEffect, useState } from 'react';

/**
 * Debug component to show current API configuration
 * Remove this in production!
 */
export function ApiDebug() {
  const [apiUrl, setApiUrl] = useState<string>('');
  const [cookies, setCookies] = useState<string>('');

  useEffect(() => {
    // Get API URL from environment
    const url = process.env.NEXT_PUBLIC_API_URL || 'NOT SET';
    setApiUrl(url);

    // Get cookies
    setCookies(document.cookie || 'No cookies');
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 10,
      right: 10,
      background: '#1a1a1a',
      color: '#00ff00',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      maxWidth: '400px',
      border: '2px solid #00ff00'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>🔍 API Debug</div>
      <div><strong>API URL:</strong> {apiUrl}</div>
      <div style={{ marginTop: '5px', fontSize: '10px', opacity: 0.7 }}>
        <strong>Cookies:</strong> {cookies.substring(0, 50)}...
      </div>
      <div style={{ marginTop: '5px', fontSize: '10px', color: '#ffff00' }}>
        {apiUrl.includes('localhost') ? '✅ Using LOCAL API' : '⚠️ Using REMOTE API'}
      </div>
    </div>
  );
}
