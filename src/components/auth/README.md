# Two-Factor Authentication (2FA) Components

This directory contains all the UI components needed for implementing Two-Factor Authentication in the application.

## Components

### 1. TwoFactorSetup
The main component for enabling 2FA. It guides users through the setup process.

**Features:**
- Sends verification code to user's email
- Validates the code
- Displays backup codes
- Handles errors and loading states

**Usage:**
```tsx
import { TwoFactorSetup } from '@/components/auth';

function MyComponent() {
  return (
    <TwoFactorSetup
      onSuccess={() => {
        // Handle successful setup
        console.log('2FA enabled successfully');
      }}
      onCancel={() => {
        // Handle cancellation
        console.log('Setup cancelled');
      }}
    />
  );
}
```

### 2. TwoFactorInput
A specialized input component for entering 6-digit verification codes.

**Features:**
- Auto-focus next input on entry
- Paste support for codes
- Keyboard navigation (arrows, backspace)
- Auto-submit when complete
- Error display

**Usage:**
```tsx
import { TwoFactorInput } from '@/components/auth';

function MyComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleComplete = async (code: string) => {
    setIsLoading(true);
    try {
      // Verify the code
      await api.post('/auth/2fa/verify', { code });
    } catch (err) {
      setError('Invalid code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TwoFactorInput
      onComplete={handleComplete}
      isLoading={isLoading}
      error={error}
      length={6} // Optional, defaults to 6
    />
  );
}
```

### 3. TwoFactorBackupCodes
Displays backup codes after successful 2FA setup.

**Features:**
- Copy codes to clipboard
- Download codes as text file
- Requires acknowledgment before continuing
- Formatted for easy reading

**Usage:**
```tsx
import { TwoFactorBackupCodes } from '@/components/auth';

function MyComponent() {
  const codes = [
    'ABC123', 'DEF456', 'GHI789',
    'JKL012', 'MNO345', 'PQR678',
    'STU901', 'VWX234', 'YZA567', 'BCD890'
  ];

  return (
    <TwoFactorBackupCodes
      codes={codes}
      onAcknowledge={() => {
        // User has acknowledged saving the codes
        console.log('Codes acknowledged');
      }}
    />
  );
}
```

### 4. TwoFactorSettings
A complete settings component for managing 2FA status (enable/disable).

**Features:**
- Shows current 2FA status
- Enable 2FA flow
- Disable 2FA with password confirmation
- Success/error messages
- Integrates all other components

**Usage:**
```tsx
import { TwoFactorSettings } from '@/components/auth';

function SettingsPage() {
  const { user } = useAuth();

  return (
    <TwoFactorSettings
      isEnabled={user?.twoFactorEnabled || false}
      onStatusChange={(enabled) => {
        console.log('2FA status changed:', enabled);
        // Optionally refetch user data
      }}
    />
  );
}
```

## Integration Example: Settings Page

Here's how to integrate the TwoFactorSettings component into an existing settings page:

```tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TwoFactorSettings } from '@/components/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function SettingsPage() {
  const { user, refetchUser } = useAuth();
  const [activeTab, setActiveTab] = useState('security');

  const handleTwoFactorChange = async (enabled: boolean) => {
    // Refetch user data to update the UI
    await refetchUser();
    
    // Show success message
    console.log(`2FA ${enabled ? 'enabled' : 'disabled'} successfully`);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
      
      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded ${
            activeTab === 'security' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Security
        </button>
        {/* Other tabs... */}
      </div>

      {/* Security Tab Content */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Password Change Section */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Password change form... */}
            </CardContent>
          </Card>

          {/* 2FA Settings Section */}
          <TwoFactorSettings
            isEnabled={user?.twoFactorEnabled || false}
            onStatusChange={handleTwoFactorChange}
          />
        </div>
      )}
    </div>
  );
}
```

## API Endpoints Required

The components expect the following API endpoints to be available:

### Enable 2FA
```
POST /api/auth/2fa/enable
Response: { success: true, message: "Code sent to email" }
```

### Verify 2FA Code
```
POST /api/auth/2fa/verify
Body: { code: string }
Response: { 
  success: true, 
  data: { 
    backupCodes: string[] 
  } 
}
```

### Disable 2FA
```
POST /api/auth/2fa/disable
Body: { password: string }
Response: { success: true, message: "2FA disabled" }
```

## Styling

All components use:
- Tailwind CSS for styling
- shadcn/ui components (Card, Button, Input)
- Lucide React for icons
- Responsive design
- Dark mode support (where applicable)

## Accessibility

The components include:
- Proper ARIA labels
- Keyboard navigation support
- Focus management
- Screen reader friendly
- Error announcements

## Testing

To test the components:

1. **Enable 2FA Flow:**
   - Click "Enable 2FA" button
   - Verify email is sent
   - Enter the 6-digit code
   - Save backup codes
   - Verify 2FA is enabled

2. **Disable 2FA Flow:**
   - Click "Disable 2FA" button
   - Enter password
   - Verify 2FA is disabled

3. **Error Handling:**
   - Test with invalid codes
   - Test with expired codes
   - Test with wrong password
   - Verify error messages display correctly

## Notes

- All components use TypeScript for type safety
- Error handling is built into each component
- Loading states are managed internally
- Components are fully responsive
- Dark mode compatible (where applicable)
