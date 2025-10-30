'use client';

/**
 * Test page for 2FA components
 * This page demonstrates all the 2FA UI components
 * Navigate to /test-2fa-components to view
 */

import { useState } from 'react';
import { TwoFactorSetup, TwoFactorInput, TwoFactorBackupCodes, TwoFactorSettings } from '@/components/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Test2FAComponents() {
  const [activeDemo, setActiveDemo] = useState<string>('settings');
  const [mockEnabled, setMockEnabled] = useState(false);

  const mockBackupCodes = [
    'ABC123', 'DEF456', 'GHI789', 'JKL012', 'MNO345',
    'PQR678', 'STU901', 'VWX234', 'YZA567', 'BCD890'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            2FA Components Demo
          </h1>
          <p className="text-gray-600">
            Test and preview all Two-Factor Authentication UI components
          </p>
        </div>

        {/* Component Selector */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Button
            onClick={() => setActiveDemo('settings')}
            variant={activeDemo === 'settings' ? 'default' : 'outline'}
          >
            Settings Component
          </Button>
          <Button
            onClick={() => setActiveDemo('setup')}
            variant={activeDemo === 'setup' ? 'default' : 'outline'}
          >
            Setup Flow
          </Button>
          <Button
            onClick={() => setActiveDemo('input')}
            variant={activeDemo === 'input' ? 'default' : 'outline'}
          >
            Code Input
          </Button>
          <Button
            onClick={() => setActiveDemo('backup')}
            variant={activeDemo === 'backup' ? 'default' : 'outline'}
          >
            Backup Codes
          </Button>
        </div>

        {/* Component Demos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Demo Area */}
          <div>
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Component Demo</CardTitle>
                <CardDescription>
                  {activeDemo === 'settings' && 'Complete 2FA settings management'}
                  {activeDemo === 'setup' && 'Full setup wizard flow'}
                  {activeDemo === 'input' && '6-digit code input component'}
                  {activeDemo === 'backup' && 'Backup codes display'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeDemo === 'settings' && (
                  <TwoFactorSettings
                    isEnabled={mockEnabled}
                    onStatusChange={(enabled) => {
                      setMockEnabled(enabled);
                      console.log('2FA status changed:', enabled);
                    }}
                  />
                )}

                {activeDemo === 'setup' && (
                  <TwoFactorSetup
                    onSuccess={() => {
                      console.log('Setup completed!');
                      alert('2FA Setup completed successfully!');
                    }}
                    onCancel={() => {
                      console.log('Setup cancelled');
                      alert('Setup cancelled');
                    }}
                  />
                )}

                {activeDemo === 'input' && (
                  <div className="space-y-4">
                    <TwoFactorInput
                      onComplete={(code) => {
                        console.log('Code entered:', code);
                        alert(`Code entered: ${code}`);
                      }}
                      isLoading={false}
                      error=""
                    />
                    <div className="text-sm text-gray-600">
                      <p className="font-medium mb-2">Features:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Auto-focus next input</li>
                        <li>Paste support (try pasting "123456")</li>
                        <li>Keyboard navigation (arrows, backspace)</li>
                        <li>Auto-submit when complete</li>
                      </ul>
                    </div>
                  </div>
                )}

                {activeDemo === 'backup' && (
                  <TwoFactorBackupCodes
                    codes={mockBackupCodes}
                    onAcknowledge={() => {
                      console.log('Backup codes acknowledged');
                      alert('Backup codes acknowledged!');
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Info Panel */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Component Info</CardTitle>
                <CardDescription>Details about the current component</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeDemo === 'settings' && (
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm mb-1">TwoFactorSettings</h4>
                      <p className="text-sm text-gray-600">
                        Complete component for managing 2FA status in user settings.
                      </p>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm mb-1">Features:</h5>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                        <li>Shows current 2FA status</li>
                        <li>Enable flow with setup wizard</li>
                        <li>Disable with password confirmation</li>
                        <li>Success/error messaging</li>
                        <li>Status change callbacks</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm mb-1">Props:</h5>
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
{`isEnabled: boolean
onStatusChange?: (enabled: boolean) => void`}
                      </pre>
                    </div>
                  </div>
                )}

                {activeDemo === 'setup' && (
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-bold text-sm mb-1">TwoFactorSetup</h4>
                      <p className="text-sm text-gray-600">
                        Guides users through the complete 2FA setup process.
                      </p>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm mb-1">Steps:</h5>
                      <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                        <li>Initial setup screen</li>
                        <li>Code verification</li>
                        <li>Backup codes display</li>
                      </ol>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm mb-1">Props:</h5>
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
{`onSuccess?: () => void
onCancel?: () => void`}
                      </pre>
                    </div>
                  </div>
                )}

                {activeDemo === 'input' && (
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-bold text-sm mb-1">TwoFactorInput</h4>
                      <p className="text-sm text-gray-600">
                        Specialized input for 6-digit verification codes.
                      </p>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm mb-1">Features:</h5>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                        <li>Auto-focus next input</li>
                        <li>Paste support</li>
                        <li>Keyboard navigation</li>
                        <li>Auto-submit when complete</li>
                        <li>Clear functionality</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm mb-1">Props:</h5>
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
{`onComplete: (code: string) => void
isLoading?: boolean
error?: string
length?: number // default: 6`}
                      </pre>
                    </div>
                  </div>
                )}

                {activeDemo === 'backup' && (
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-bold text-sm mb-1">TwoFactorBackupCodes</h4>
                      <p className="text-sm text-gray-600">
                        Displays backup codes after successful 2FA setup.
                      </p>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm mb-1">Features:</h5>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                        <li>Copy to clipboard</li>
                        <li>Download as text file</li>
                        <li>Requires acknowledgment</li>
                        <li>Important warnings</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm mb-1">Props:</h5>
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
{`codes: string[]
onAcknowledge: () => void`}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Common Info */}
                <div className="pt-4 border-t">
                  <h5 className="font-medium text-sm mb-2">Integration:</h5>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
{`import { ${activeDemo === 'settings' ? 'TwoFactorSettings' : 
           activeDemo === 'setup' ? 'TwoFactorSetup' : 
           activeDemo === 'input' ? 'TwoFactorInput' : 
           'TwoFactorBackupCodes'} } from '@/components/auth';`}
                  </pre>
                </div>

                <div className="pt-2">
                  <h5 className="font-medium text-sm mb-2">Documentation:</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>📄 <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">src/components/auth/README.md</code></li>
                    <li>📘 <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">src/components/auth/INTEGRATION_GUIDE.md</code></li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Status Card */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Current State</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">2FA Status:</span>
                    <span className={`font-medium ${mockEnabled ? 'text-green-600' : 'text-gray-600'}`}>
                      {mockEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Demo:</span>
                    <span className="font-medium">{activeDemo}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> This is a demo page for testing components. 
            The actual API calls are not made in this demo. Check the browser console 
            for component events and interactions.
          </p>
        </div>
      </div>
    </div>
  );
}
