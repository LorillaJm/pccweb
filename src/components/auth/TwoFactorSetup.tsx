'use client';

import { useState } from 'react';
import { Shield, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { TwoFactorInput } from './TwoFactorInput';
import { TwoFactorBackupCodes } from './TwoFactorBackupCodes';

interface TwoFactorSetupProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

type SetupStep = 'initial' | 'verify' | 'backup-codes';

export function TwoFactorSetup({ onSuccess, onCancel }: TwoFactorSetupProps) {
  const [step, setStep] = useState<SetupStep>('initial');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const handleEnable2FA = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/2fa/enable');
      
      if (response.data.success) {
        setStep('verify');
      } else {
        setError(response.data.message || 'Failed to enable 2FA');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to enable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (code: string) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/2fa/verify', { code });
      
      if (response.data.success) {
        // Store backup codes if provided
        if (response.data.data?.backupCodes) {
          setBackupCodes(response.data.data.backupCodes);
          setStep('backup-codes');
        } else {
          // If no backup codes, complete setup
          onSuccess?.();
        }
      } else {
        setError(response.data.message || 'Invalid code');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupCodesAcknowledged = () => {
    onSuccess?.();
  };

  if (step === 'backup-codes') {
    return (
      <TwoFactorBackupCodes
        codes={backupCodes}
        onAcknowledge={handleBackupCodesAcknowledged}
      />
    );
  }

  if (step === 'verify') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            Verify Your Code
          </CardTitle>
          <CardDescription>
            We've sent a 6-digit code to your email. Enter it below to complete setup.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TwoFactorInput
            onComplete={handleVerifyCode}
            isLoading={isLoading}
            error={error}
          />
          
          <Button
            variant="outline"
            onClick={() => setStep('initial')}
            className="w-full"
            disabled={isLoading}
          >
            Cancel
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Enable Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 text-sm">Enhanced Security</h4>
              <p className="text-sm text-blue-700 mt-1">
                Protect your account with a verification code sent to your email each time you log in.
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <p className="font-medium text-gray-900">How it works:</p>
            <ul className="space-y-1 ml-4">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span>A 6-digit code will be sent to your email</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Enter the code to complete login</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <span>Receive backup codes for account recovery</span>
              </li>
            </ul>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={handleEnable2FA}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Enabling...' : 'Enable 2FA'}
          </Button>
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
