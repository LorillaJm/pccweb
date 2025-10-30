'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

interface EmailValidationFeedbackProps {
  email: string;
  onValidationChange?: (isValid: boolean) => void;
}

// Common disposable email domains
const DISPOSABLE_DOMAINS = [
  'tempmail.com', 'throwaway.email', '10minutemail.com', 'guerrillamail.com',
  'mailinator.com', 'maildrop.cc', 'temp-mail.org', 'getnada.com',
  'trashmail.com', 'yopmail.com', 'fakeinbox.com', 'sharklasers.com'
];

export function EmailValidationFeedback({ email, onValidationChange }: EmailValidationFeedbackProps) {
  const [status, setStatus] = useState<'idle' | 'checking' | 'valid' | 'disposable' | 'invalid'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!email || !email.includes('@')) {
      setStatus('idle');
      setMessage('');
      onValidationChange?.(false);
      return;
    }

    // Basic email format validation
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) {
      setStatus('invalid');
      setMessage('Invalid email format');
      onValidationChange?.(false);
      return;
    }

    // Check for disposable email
    const domain = email.split('@')[1]?.toLowerCase();
    if (domain && DISPOSABLE_DOMAINS.includes(domain)) {
      setStatus('disposable');
      setMessage('Disposable email addresses are not allowed');
      onValidationChange?.(false);
      return;
    }

    // Email looks valid
    setStatus('valid');
    setMessage('Email format is valid');
    onValidationChange?.(true);
  }, [email, onValidationChange]);

  if (status === 'idle') return null;

  return (
    <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
      status === 'checking' ? 'bg-blue-50 text-blue-700' :
      status === 'valid' ? 'bg-green-50 text-green-700' :
      status === 'disposable' ? 'bg-yellow-50 text-yellow-700' :
      'bg-red-50 text-red-700'
    }`}>
      {status === 'checking' && <Loader2 className="h-4 w-4 mt-0.5 animate-spin flex-shrink-0" />}
      {status === 'valid' && <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />}
      {(status === 'disposable' || status === 'invalid') && (
        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
      )}
      <div className="flex-1">
        <p className="font-medium">{message}</p>
        {status === 'disposable' && (
          <p className="text-xs mt-1 opacity-90">
            Please use a permanent email address for account registration.
          </p>
        )}
      </div>
    </div>
  );
}
