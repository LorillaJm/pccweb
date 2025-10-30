'use client';

import { useState } from 'react';
import { AlertCircle, X, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface VerificationBannerProps {
  email: string;
  onDismiss?: () => void;
}

export function VerificationBanner({ email, onDismiss }: VerificationBannerProps) {
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');
  const [isDismissed, setIsDismissed] = useState(false);

  const resendVerification = async () => {
    setIsResending(true);
    setMessage('');

    try {
      await api.post('/auth/resend-verification', { email });
      setMessage('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      setMessage(error.response?.data?.error?.message || 'Failed to resend email');
    } finally {
      setIsResending(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Email Verification Required
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Please verify your email address to access all features. Check your inbox for the verification email.
            </p>
            {message && (
              <p className="mt-2 font-medium text-yellow-900">{message}</p>
            )}
          </div>
          <div className="mt-4">
            <Button
              onClick={resendVerification}
              disabled={isResending}
              size="sm"
              variant="outline"
              className="bg-white hover:bg-yellow-50"
            >
              <Mail className="h-4 w-4 mr-2" />
              {isResending ? 'Sending...' : 'Resend Verification Email'}
            </Button>
          </div>
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={handleDismiss}
            className="inline-flex text-yellow-400 hover:text-yellow-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
