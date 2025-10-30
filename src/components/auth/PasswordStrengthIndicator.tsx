'use client';

import { useMemo } from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface PasswordRequirement {
  label: string;
  met: boolean;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const requirements = useMemo((): PasswordRequirement[] => {
    return [
      {
        label: 'At least 8 characters',
        met: password.length >= 8
      },
      {
        label: 'Contains uppercase letter',
        met: /[A-Z]/.test(password)
      },
      {
        label: 'Contains lowercase letter',
        met: /[a-z]/.test(password)
      },
      {
        label: 'Contains number',
        met: /\d/.test(password)
      },
      {
        label: 'Contains special character',
        met: /[!@#$%^&*(),.?":{}|<>]/.test(password)
      }
    ];
  }, [password]);

  const strength = useMemo(() => {
    const metCount = requirements.filter(r => r.met).length;
    if (metCount === 0) return { label: '', color: '', width: '0%' };
    if (metCount <= 2) return { label: 'Weak', color: 'bg-red-500', width: '33%' };
    if (metCount <= 3) return { label: 'Fair', color: 'bg-yellow-500', width: '66%' };
    if (metCount <= 4) return { label: 'Good', color: 'bg-blue-500', width: '83%' };
    return { label: 'Strong', color: 'bg-green-500', width: '100%' };
  }, [requirements]);

  if (!password) return null;

  return (
    <div className="space-y-3">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-gray-600">Password Strength</span>
          {strength.label && (
            <span className={`text-xs font-semibold ${
              strength.label === 'Weak' ? 'text-red-600' :
              strength.label === 'Fair' ? 'text-yellow-600' :
              strength.label === 'Good' ? 'text-blue-600' :
              'text-green-600'
            }`}>
              {strength.label}
            </span>
          )}
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${strength.color} transition-all duration-300 ease-out`}
            style={{ width: strength.width }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-1.5">
        {requirements.map((req, index) => (
          <div
            key={index}
            className={`flex items-center text-xs ${
              req.met ? 'text-green-600' : 'text-gray-500'
            }`}
          >
            {req.met ? (
              <Check className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
            ) : (
              <X className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
            )}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
