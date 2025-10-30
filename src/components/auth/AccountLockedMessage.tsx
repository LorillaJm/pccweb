'use client';

import { useEffect, useState } from 'react';
import { Lock, Clock, AlertCircle } from 'lucide-react';

interface AccountLockedMessageProps {
  lockoutEndTime?: string | Date;
  reason?: string;
}

export function AccountLockedMessage({ lockoutEndTime, reason }: AccountLockedMessageProps) {
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    if (!lockoutEndTime) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const end = new Date(lockoutEndTime).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeRemaining('You can try logging in again now');
        return;
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeRemaining(`${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [lockoutEndTime]);

  return (
    <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg space-y-3">
      <div className="flex items-start">
        <Lock className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-900">
            Account Temporarily Locked
          </h3>
          <p className="text-sm text-red-800 mt-1">
            {reason || 'Your account has been temporarily locked due to multiple failed login attempts.'}
          </p>
        </div>
      </div>

      {lockoutEndTime && timeRemaining && (
        <div className="flex items-center gap-2 p-3 bg-white border border-red-200 rounded">
          <Clock className="h-5 w-5 text-red-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">
              Time remaining: <span className="font-mono">{timeRemaining}</span>
            </p>
            <p className="text-xs text-red-700 mt-0.5">
              You can try logging in again after the countdown ends
            </p>
          </div>
        </div>
      )}

      <div className="space-y-2 text-sm text-red-800">
        <p className="font-medium">Security Information:</p>
        <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
          <li>Accounts are locked for 15 minutes after 3 failed attempts</li>
          <li>This helps protect your account from unauthorized access</li>
          <li>Make sure you're using the correct password</li>
          <li>Contact support if you've forgotten your password</li>
        </ul>
      </div>

      <div className="flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-yellow-800">
          If you didn't attempt to log in, please contact support immediately as your account may be compromised.
        </p>
      </div>
    </div>
  );
}
