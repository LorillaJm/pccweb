'use client';

import { useState } from 'react';
import { Mail, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface EmailVerificationRequiredProps {
  email: string;
  onResendSuccess?: () => void;
}

export function EmailVerificationRequired({ email, onResendSuccess }: EmailVerificationRequiredProps) {
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResend = async () => {
    setIsResending(true);
    setMessage('');
    setError('');

    try {
      const response = await api.post('/auth/resend-verification', { email });
      
      if (response.data.success) {
        setMessage('Verification email sent! Please check your inbox.');
        onResendSuccess?.();
      } else {
        setError(response.data.message || 'Failed to resend email');
      }
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError('Too many requests. Please try again in a few minutes.');
      } else {
        setError(err.response?.data?.message || 'Failed to resend verification email');
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg space-y-3">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-yellow-900">
            Email Verification Required
          </h3>
          <p className="text-sm text-yellow-800 mt-1">
            You must verify your email address before you can log in. Check your inbox for the verification email.
          </p>
          <p className="text-sm text-yellow-700 mt-2 font-medium">
            Email: {email}
          </p>
        </div>
      </div>

      {message && (
        <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
          <Mail className="h-4 w-4 text-green-600" />
          <p className="text-sm text-green-700">{message}</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={handleResend}
          disabled={isResending}
          size="sm"
          variant="outline"
          className="bg-white hover:bg-yellow-50"
        >
          {isResending ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Mail className="h-4 w-4 mr-2" />
              Resend Verification Email
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-yellow-700">
        Didn't receive the email? Check your spam folder or click the button above to resend.
      </p>
    </div>
  );
}
