'use client';

import { useState } from 'react';
import { Shield, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { TwoFactorSetup } from './TwoFactorSetup';

interface TwoFactorSettingsProps {
  isEnabled: boolean;
  onStatusChange?: (enabled: boolean) => void;
}

export function TwoFactorSettings({ isEnabled: initialEnabled, onStatusChange }: TwoFactorSettingsProps) {
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [showSetup, setShowSetup] = useState(false);
  const [showDisable, setShowDisable] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleEnable = () => {
    setShowSetup(true);
    setError('');
    setSuccess('');
  };

  const handleSetupSuccess = () => {
    setIsEnabled(true);
    setShowSetup(false);
    setSuccess('Two-factor authentication has been enabled successfully!');
    onStatusChange?.(true);
  };

  const handleSetupCancel = () => {
    setShowSetup(false);
    setError('');
  };

  const handleDisableRequest = () => {
    setShowDisable(true);
    setPassword('');
    setError('');
    setSuccess('');
  };

  const handleDisableCancel = () => {
    setShowDisable(false);
    setPassword('');
    setError('');
  };

  const handleDisableConfirm = async () => {
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/2fa/disable', { password });
      
      if (response.data.success) {
        setIsEnabled(false);
        setShowDisable(false);
        setPassword('');
        setSuccess('Two-factor authentication has been disabled.');
        onStatusChange?.(false);
      } else {
        setError(response.data.message || 'Failed to disable 2FA');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to disable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  if (showSetup) {
    return (
      <div className="flex justify-center">
        <TwoFactorSetup
          onSuccess={handleSetupSuccess}
          onCancel={handleSetupCancel}
        />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Display */}
        <div className={`p-4 rounded-lg border ${
          isEnabled 
            ? 'bg-green-50 border-green-200' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isEnabled ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Shield className="h-5 w-5 text-gray-400" />
              )}
              <div>
                <p className="font-medium text-sm">
                  {isEnabled ? '2FA is Enabled' : '2FA is Disabled'}
                </p>
                <p className="text-sm text-gray-600">
                  {isEnabled 
                    ? 'Your account is protected with two-factor authentication' 
                    : 'Enable 2FA to add an extra layer of security'}
                </p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              isEnabled 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {isEnabled ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Enable/Disable Section */}
        {!isEnabled ? (
          <div className="space-y-3">
            <div className="text-sm text-gray-600 space-y-2">
              <p className="font-medium text-gray-900">Why enable 2FA?</p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>Protect your account from unauthorized access</li>
                <li>Receive a code via email each time you log in</li>
                <li>Get backup codes for account recovery</li>
              </ul>
            </div>
            <Button onClick={handleEnable} className="w-full">
              <Shield className="h-4 w-4 mr-2" />
              Enable Two-Factor Authentication
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {!showDisable ? (
              <>
                <div className="text-sm text-gray-600 space-y-2">
                  <p className="font-medium text-gray-900">2FA is Active</p>
                  <p>
                    You'll need to enter a verification code sent to your email each time you log in.
                  </p>
                </div>
                <Button 
                  variant="destructive" 
                  onClick={handleDisableRequest}
                  className="w-full"
                >
                  Disable Two-Factor Authentication
                </Button>
              </>
            ) : (
              <div className="space-y-3 p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-start gap-2">
                  <Lock className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900">
                      Confirm Password to Disable 2FA
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      Enter your password to confirm you want to disable two-factor authentication.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="bg-white"
                  />
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleDisableCancel}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDisableConfirm}
                      disabled={isLoading || !password}
                      className="flex-1"
                    >
                      {isLoading ? 'Disabling...' : 'Confirm Disable'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        <div className="pt-4 border-t text-xs text-gray-500 space-y-1">
          <p className="font-medium text-gray-700">About Two-Factor Authentication:</p>
          <ul className="space-y-0.5 ml-4 list-disc">
            <li>Codes are sent to your registered email address</li>
            <li>Each code expires after 10 minutes</li>
            <li>You'll receive backup codes for account recovery</li>
            <li>Your account will be locked for 15 minutes after 3 failed attempts</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
