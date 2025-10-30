# Integration Example: Adding 2FA to Settings Page

This guide shows how to integrate the TwoFactorSettings component into the existing student settings page.

## Step 1: Update the Settings Page

Replace the placeholder 2FA section in `src/app/portal/student/settings/page.tsx` with the actual TwoFactorSettings component.

### Find this code (around line 245):

```tsx
<Card className="shadow-xl border-slate-200">
  <CardHeader className="bg-gradient-to-r from-slate-50 to-green-50">
    <CardTitle className="flex items-center text-slate-900">
      <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Two-Factor Authentication
    </CardTitle>
    <CardDescription>Add an extra layer of security to your account</CardDescription>
  </CardHeader>
  <CardContent className="pt-6">
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
      <div>
        <p className="font-semibold text-slate-900">Two-Factor Authentication</p>
        <p className="text-sm text-slate-600">Currently disabled</p>
      </div>
      <Button variant="outline" className="border-slate-300">
        Enable 2FA
      </Button>
    </div>
  </CardContent>
</Card>
```

### Replace with:

```tsx
import { TwoFactorSettings } from '@/components/auth';

// Inside the component, add this handler:
const handleTwoFactorChange = async (enabled: boolean) => {
  // Refetch user data to update the UI
  await refetchUser();
  
  // Show success message
  setSuccess(enabled ? '2FA enabled successfully!' : '2FA disabled successfully!');
  setTimeout(() => setSuccess(''), 3000);
};

// In the JSX, replace the 2FA Card with:
<TwoFactorSettings
  isEnabled={user?.twoFactorEnabled || false}
  onStatusChange={handleTwoFactorChange}
/>
```

## Step 2: Update Imports

Add the import at the top of the file:

```tsx
import { TwoFactorSettings } from '@/components/auth';
```

## Step 3: Add refetchUser to AuthContext (if not already present)

If your AuthContext doesn't have a `refetchUser` method, you'll need to add it or remove that call.

## Complete Example

Here's a complete example of the Account Security section with 2FA integrated:

```tsx
{activeTab === 'account' && (
  <div className="space-y-6">
    {/* Password Change Card */}
    <Card className="shadow-xl border-slate-200">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50">
        <CardTitle className="flex items-center text-slate-900">
          <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Change Password
        </CardTitle>
        <CardDescription>Update your password to keep your account secure</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {/* Password change form fields... */}
        <div className="space-y-2">
          <Label htmlFor="currentPassword" className="text-slate-700 font-semibold">Current Password</Label>
          <Input
            id="currentPassword"
            type="password"
            value={accountSettings.currentPassword}
            onChange={(e) => setAccountSettings({ ...accountSettings, currentPassword: e.target.value })}
            className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter current password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-slate-700 font-semibold">New Password</Label>
          <Input
            id="newPassword"
            type="password"
            value={accountSettings.newPassword}
            onChange={(e) => setAccountSettings({ ...accountSettings, newPassword: e.target.value })}
            className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter new password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-slate-700 font-semibold">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={accountSettings.confirmPassword}
            onChange={(e) => setAccountSettings({ ...accountSettings, confirmPassword: e.target.value })}
            className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Confirm new password"
          />
        </div>
        <Button
          onClick={handlePasswordChange}
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </Button>
      </CardContent>
    </Card>

    {/* 2FA Settings - New Component */}
    <TwoFactorSettings
      isEnabled={user?.twoFactorEnabled || false}
      onStatusChange={handleTwoFactorChange}
    />
  </div>
)}
```

## Step 4: Update User Model Type (if needed)

Make sure your User type includes the `twoFactorEnabled` field:

```typescript
// In your API types file (e.g., src/lib/api.ts)
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean; // Add this field
  // ... other fields
}
```

## Testing the Integration

1. **Navigate to Settings:**
   - Go to `/portal/student/settings` (or your settings route)
   - Click on the "Account" or "Security" tab

2. **Enable 2FA:**
   - Click "Enable Two-Factor Authentication"
   - Verify that a code is sent to your email
   - Enter the 6-digit code
   - Save the backup codes
   - Verify the status changes to "Enabled"

3. **Disable 2FA:**
   - Click "Disable Two-Factor Authentication"
   - Enter your password
   - Verify the status changes to "Disabled"

## Troubleshooting

### Issue: "2FA status doesn't update after enabling/disabling"
**Solution:** Make sure you're calling `refetchUser()` or updating the user state after the status changes.

### Issue: "API endpoints return 404"
**Solution:** Ensure the backend 2FA endpoints are implemented (Tasks 10-11 in the spec).

### Issue: "TypeScript errors about twoFactorEnabled"
**Solution:** Add the `twoFactorEnabled` field to your User type definition.

### Issue: "Component doesn't match the design"
**Solution:** The component uses Tailwind CSS and shadcn/ui components. Make sure these are properly configured in your project.

## Next Steps

After integrating the component:

1. Test the complete flow with real email delivery
2. Add 2FA to the login flow (Task 19)
3. Implement 2FA for admin users
4. Add 2FA status to user profile displays
5. Create admin dashboard for managing user 2FA status

## Additional Features

You can extend the TwoFactorSettings component with:

- **2FA Method Selection:** Add support for SMS or authenticator apps
- **Backup Code Management:** Allow users to regenerate backup codes
- **2FA History:** Show when 2FA was last used
- **Trusted Devices:** Remember devices to skip 2FA
- **2FA Recovery:** Add account recovery options
