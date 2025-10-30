'use client';

import { useState, useRef, KeyboardEvent, ClipboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TwoFactorInputProps {
  onComplete: (code: string) => void;
  isLoading?: boolean;
  error?: string;
  length?: number;
}

export function TwoFactorInput({ 
  onComplete, 
  isLoading = false, 
  error = '',
  length = 6 
}: TwoFactorInputProps) {
  const [code, setCode] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newCode.every(digit => digit !== '') && !isLoading) {
      onComplete(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    
    // Only accept numeric paste
    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.slice(0, length).split('');
    const newCode = [...code];
    
    digits.forEach((digit, index) => {
      if (index < length) {
        newCode[index] = digit;
      }
    });

    setCode(newCode);

    // Focus the next empty input or the last input
    const nextEmptyIndex = newCode.findIndex(digit => digit === '');
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : length - 1;
    inputRefs.current[focusIndex]?.focus();

    // Auto-submit if all fields are filled
    if (newCode.every(digit => digit !== '') && !isLoading) {
      onComplete(newCode.join(''));
    }
  };

  const handleClear = () => {
    setCode(Array(length).fill(''));
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-center">
        {Array.from({ length }).map((_, index) => (
          <Input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={code[index]}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={isLoading}
            className={cn(
              "w-12 h-12 text-center text-lg font-semibold",
              error && "border-red-500 focus-visible:ring-red-500"
            )}
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleClear}
          disabled={isLoading || code.every(digit => digit === '')}
          className="flex-1"
        >
          Clear
        </Button>
        <Button
          type="button"
          onClick={() => onComplete(code.join(''))}
          disabled={isLoading || code.some(digit => digit === '')}
          className="flex-1"
        >
          {isLoading ? 'Verifying...' : 'Verify'}
        </Button>
      </div>

      <p className="text-xs text-center text-gray-500">
        Enter the 6-digit code sent to your email
      </p>
    </div>
  );
}
