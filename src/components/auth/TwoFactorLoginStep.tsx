'use client';

import { useState } from 'react';
import { Shield, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TwoFactorInput } from './TwoFactorInput';
import { api } from '@/lib/api';

interface TwoFactorLoginStepProps {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
}

export function TwoFactorLoginStep({ email, onSuccess, onBack }: TwoFactorLoginStepProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const handleVerifyCode = async (code: string) => {
    setIsVerifying(true);
    setError('');

    try {
      const response = await api.post('/auth/2fa/verify-login', { code });
      
      if (response.data.success) {
        onSuccess();
      } else {
        setError(response.data.message || 'Invalid code. Please try again.');
      }
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError('Too many attempts. Please try again in a few minutes.');
      } else if (err.response?.status === 423) {
        setError('Account locked due to too many failed attempts. Please try again in 15 minutes.');
      } else {
        setError(err.response?.data?.message || 'Verification failed. Please try again.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setResendMessage('');
    setError('');

    try {
      const response = await api.post('/auth/2fa/resend');
      
      if (response.data.success) {
        setResendMessage('New code sent to your email!');
        setTimeout(() => setResendMessage(''), 5000);
      } else {
        setError(response.data.message || 'Failed to resend code');
      }
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError('Too many requests. Please wait before requesting another code.');
      } else {
        setError(err.response?.data?.message || 'Failed to resend code');
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <Shield className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Two-Factor Authentication
        </h3>
        <p className="text-gray-600">
          Enter the 6-digit code sent to your email
        </p>
        <p className="text-sm text-gray-500 mt-1 font-medium">
          {email}
        </p>
      </div>

      {/* 2FA Input */}
      <div>
        <TwoFactorInput
          onComplete={handleVerifyCode}
          isLoading={isVerifying}
          error={error}
        />
      </div>

      {/* Resend Message */}
      {resendMessage && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <Mail className="h-4 w-4 text-green-600" />
          <p className="text-sm text-green-700">{resendMessage}</p>
        </div>
      )}

      {/* Resend Button */}
      <div className="text-center space-y-3">
        <p className="text-sm text-gray-600">
          Didn't receive the code?
        </p>
        <Button
          onClick={handleResendCode}
          disabled={isResending}
          variant="outline"
          size="sm"
        >
          {isResending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Sending...
            </>
          ) : (
            <>
              <Mail className="h-4 w-4 mr-2" />
              Resend Code
            </>
          )}
        </Button>
      </div>

      {/* Back Button */}
      <div className="pt-4 border-t">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="w-full"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Login
        </Button>
      </div>

      {/* Help Text */}
      <div className="text-xs text-gray-500 text-center space-y-1">
        <p>The code expires in 10 minutes.</p>
        <p>Check your spam folder if you don't see the email.</p>
      </div>
    </div>
  );
}
