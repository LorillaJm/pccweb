'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'input'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (token) {
      verifyWithToken(token);
    } else {
      setStatus('input');
    }
  }, [token]);

  const verifyWithToken = async (verificationToken: string) => {
    try {
      const response = await api.post('/auth/verify', { token: verificationToken });
      
      if (response.data.success) {
        setStatus('success');
        setMessage('Your email has been verified successfully!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      }
    } catch (error: any) {
      setStatus('error');
      const errorMessage = error.response?.data?.error?.message || 'Verification failed';
      setMessage(errorMessage);
      
      // If token expired, show input form
      if (error.response?.data?.error?.expired) {
        setTimeout(() => setStatus('input'), 2000);
      }
    }
  };

  const verifyWithOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await api.post('/auth/verify', { email, otp });
      
      if (response.data.success) {
        setStatus('success');
        setMessage('Your email has been verified successfully!');
        
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      }
    } catch (error: any) {
      setStatus('error');
      const errorMessage = error.response?.data?.error?.message || 'Invalid verification code';
      setMessage(errorMessage);
      
      setTimeout(() => setStatus('input'), 2000);
    }
  };

  const resendVerification = async () => {
    if (!email) {
      setMessage('Please enter your email address');
      return;
    }

    setIsResending(true);
    try {
      await api.post('/auth/resend-verification', { email });
      setMessage('Verification email sent! Please check your inbox.');
      setStatus('input');
    } catch (error: any) {
      setMessage(error.response?.data?.error?.message || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-16 w-16 animate-spin text-indigo-600 mb-4" />
              <p className="text-lg font-medium text-gray-700">Verifying your email...</p>
              <p className="text-sm text-gray-500 mt-2">Please wait a moment</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 p-4">
        <Card className="w-full max-w-md border-green-200">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="rounded-full bg-green-100 p-3 mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
              <p className="text-center text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">Redirecting to login...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 p-4">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="rounded-full bg-red-100 p-3 mb-4">
                <XCircle className="h-16 w-16 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
              <p className="text-center text-gray-600 mb-6">{message}</p>
              <Button onClick={() => setStatus('input')} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-indigo-100 p-3">
              <Mail className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Verify Your Email</CardTitle>
          <CardDescription className="text-center">
            Enter the 6-digit code sent to your email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={verifyWithOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-2xl tracking-widest font-mono"
                required
              />
              <p className="text-xs text-gray-500 text-center">
                Enter the 6-digit code from your email
              </p>
            </div>

            {message && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800 text-center">{message}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={otp.length !== 6}>
              Verify Email
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={resendVerification}
                disabled={isResending}
                className="text-sm text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
              >
                {isResending ? 'Sending...' : "Didn't receive the code? Resend"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-16 w-16 animate-spin text-indigo-600 mb-4" />
              <p className="text-lg font-medium text-gray-700">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
