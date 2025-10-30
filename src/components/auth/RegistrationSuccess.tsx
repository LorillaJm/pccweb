'use client';

import { Mail, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface RegistrationSuccessProps {
  email: string;
  onResendEmail?: () => void;
  isResending?: boolean;
}

export function RegistrationSuccess({ email, onResendEmail, isResending }: RegistrationSuccessProps) {
  return (
    <div className="text-center space-y-6">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <div className="absolute -top-1 -right-1 h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center">
            <Mail className="h-3 w-3 text-white" />
          </div>
        </div>
      </div>

      {/* Success Message */}
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-gray-900">
          Registration Successful!
        </h3>
        <p className="text-gray-600">
          Your account has been created successfully.
        </p>
      </div>

      {/* Email Verification Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-left flex-1">
            <p className="text-sm font-medium text-blue-900">
              Verification Email Sent
            </p>
            <p className="text-sm text-blue-700 mt-1">
              We've sent a verification email to:
            </p>
            <p className="text-sm font-semibold text-blue-900 mt-1 break-all">
              {email}
            </p>
          </div>
        </div>

        <div className="text-left space-y-2 text-sm text-blue-700">
          <p className="font-medium">Next steps:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Check your email inbox</li>
            <li>Click the verification link or enter the code</li>
            <li>Complete your email verification</li>
            <li>Log in to access your account</li>
          </ol>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <span className="font-semibold">Important:</span> You must verify your email before you can log in to your account.
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <div className="text-sm text-gray-600">
          Didn't receive the email?
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onResendEmail && (
            <Button
              onClick={onResendEmail}
              disabled={isResending}
              variant="outline"
              size="lg"
            >
              {isResending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Resend Email
                </>
              )}
            </Button>
          )}
          <Link href="/auth/login">
            <Button size="lg">
              Go to Login
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Help Text */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>Check your spam folder if you don't see the email.</p>
        <p>The verification link will expire in 24 hours.</p>
      </div>
    </div>
  );
}
