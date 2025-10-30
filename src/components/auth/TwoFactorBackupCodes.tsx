'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface TwoFactorBackupCodesProps {
  codes: string[];
  onAcknowledge: () => void;
}

export function TwoFactorBackupCodes({ codes, onAcknowledge }: TwoFactorBackupCodesProps) {
  const [copied, setCopied] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codes.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy codes:', err);
    }
  };

  const handleDownload = () => {
    const content = `PCC Portal - Two-Factor Authentication Backup Codes\n\n` +
      `Generated: ${new Date().toLocaleString()}\n\n` +
      `IMPORTANT: Keep these codes in a safe place. Each code can only be used once.\n\n` +
      `Backup Codes:\n${codes.join('\n')}\n\n` +
      `If you lose access to your email, you can use these codes to log in.`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pcc-2fa-backup-codes-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAcknowledge = () => {
    if (!acknowledged) {
      setAcknowledged(true);
      return;
    }
    onAcknowledge();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          2FA Enabled Successfully!
        </CardTitle>
        <CardDescription>
          Save your backup codes in a secure location
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900">
                Important: Save These Codes
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Each code can only be used once. Store them in a safe place like a password manager.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-900">Your Backup Codes:</p>
          <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm">
            {codes.map((code, index) => (
              <div
                key={index}
                className="p-2 bg-white border border-gray-200 rounded text-center"
              >
                {code}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCopy}
            className="flex-1"
          >
            {copied ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Codes
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleDownload}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>

        <div className="space-y-3">
          <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm text-gray-700">
              I have saved these backup codes in a secure location. I understand that I won't be able to see them again.
            </span>
          </label>

          <Button
            onClick={handleAcknowledge}
            disabled={!acknowledged}
            className="w-full"
          >
            Continue
          </Button>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p className="font-medium">When to use backup codes:</p>
          <ul className="list-disc list-inside space-y-0.5 ml-2">
            <li>You don't have access to your email</li>
            <li>You're not receiving 2FA codes</li>
            <li>You need to recover your account</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
