'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

function AuthCallbackContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTokens } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refresh');
        const provider = searchParams.get('provider');
        const error = searchParams.get('error');

        if (error) {
          setStatus('error');
          setMessage(decodeURIComponent(error));
          return;
        }

        if (!token || !refreshToken) {
          setStatus('error');
          setMessage('Authentication failed. Missing tokens.');
          return;
        }

        // Store tokens
        localStorage.setItem('accessToken', token);
        localStorage.setItem('refreshToken', refreshToken);

        setStatus('success');
        setMessage(`Successfully authenticated with ${provider || 'social provider'}!`);

        // Redirect immediately to portal - the auth context will pick up the tokens
        setTimeout(() => {
          window.location.href = '/portal/student'; // Use window.location for full page reload
        }, 1000);

      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred during authentication.');
      }
    };

    handleCallback();
  }, [searchParams, router, setTokens]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing Authentication</h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Successful!</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">Redirecting you to the portal...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Failed</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <button
                onClick={() => router.push('/auth/login')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Back to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
            <p className="text-gray-600">Please wait</p>
          </div>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
