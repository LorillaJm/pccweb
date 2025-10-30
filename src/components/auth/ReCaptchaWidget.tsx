'use client';

import { useEffect, useRef, useState } from 'react';
import { Shield, AlertCircle } from 'lucide-react';

interface ReCaptchaWidgetProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

declare global {
  interface Window {
    grecaptcha: any;
    onRecaptchaLoad?: () => void;
  }
}

export function ReCaptchaWidget({ onVerify, onError, onExpire }: ReCaptchaWidgetProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);

  // Get site key from environment variable
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    // Check if reCAPTCHA is already loaded
    if (window.grecaptcha && window.grecaptcha.render) {
      setIsLoaded(true);
      renderRecaptcha();
      return;
    }

    // Load reCAPTCHA script
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setIsLoaded(true);
      renderRecaptcha();
    };

    script.onerror = () => {
      setError('Failed to load reCAPTCHA. Please refresh the page.');
      onError?.();
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (widgetIdRef.current !== null && window.grecaptcha) {
        try {
          window.grecaptcha.reset(widgetIdRef.current);
        } catch (e) {
          console.error('Error resetting reCAPTCHA:', e);
        }
      }
    };
  }, []);

  const renderRecaptcha = () => {
    if (!containerRef.current || !window.grecaptcha || !siteKey) return;

    // Clear existing widget if any
    if (widgetIdRef.current !== null) {
      try {
        window.grecaptcha.reset(widgetIdRef.current);
      } catch (e) {
        console.error('Error resetting reCAPTCHA:', e);
      }
    }

    try {
      widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          onVerify(token);
        },
        'expired-callback': () => {
          onExpire?.();
        },
        'error-callback': () => {
          setError('reCAPTCHA verification failed. Please try again.');
          onError?.();
        }
      });
    } catch (e) {
      console.error('Error rendering reCAPTCHA:', e);
      setError('Failed to initialize reCAPTCHA.');
      onError?.();
    }
  };

  if (!siteKey) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800">
              reCAPTCHA Not Configured
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Please add NEXT_PUBLIC_RECAPTCHA_SITE_KEY to your environment variables.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">reCAPTCHA Error</p>
            <p className="text-xs text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Shield className="h-4 w-4" />
        <span>Verify you're human</span>
      </div>
      <div
        ref={containerRef}
        className="flex justify-center"
      />
      {!isLoaded && (
        <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Loading verification...</span>
        </div>
      )}
    </div>
  );
}
