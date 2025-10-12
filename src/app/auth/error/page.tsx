'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      // Decode and simplify the error message
      const decodedMessage = decodeURIComponent(message);
      
      // Check for common error types
      if (decodedMessage.includes('SSL') || decodedMessage.includes('TLS')) {
        setErrorMessage('Database connection error. Please try again later.');
      } else if (decodedMessage.includes('MongoServerSelectionError')) {
        setErrorMessage('Unable to connect to the database. Please try again.');
      } else if (decodedMessage.includes('OAuth')) {
        setErrorMessage('Authentication failed. Please try again.');
      } else {
        setErrorMessage('An error occurred during authentication. Please try again.');
      }
    } else {
      setErrorMessage('An unexpected error occurred.');
    }
  }, [searchParams]);

  const handleRetry = () => {
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Authentication Error
          </h1>

          {/* Error Message */}
          <p className="text-gray-600 mb-6">
            {errorMessage}
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>

            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
          </div>

          {/* Help Text */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              If the problem persists, please contact support or try using email/password login.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h1>
            <p className="text-gray-600">Please wait</p>
          </div>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
