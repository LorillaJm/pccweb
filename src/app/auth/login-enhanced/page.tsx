'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, GraduationCap, Loader2, User, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  EmailVerificationRequired,
  TwoFactorLoginStep,
  AccountLockedMessage
} from '@/components/auth';

interface LoginForm {
  email: string;
  password: string;
}

type LoginStep = 'credentials' | '2fa' | 'success';

function LoginContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginStep, setLoginStep] = useState<LoginStep>('credentials');
  const [loginEmail, setLoginEmail] = useState('');
  
  // Error states
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [accountLocked, setAccountLocked] = useState(false);
  const [lockoutEndTime, setLockoutEndTime] = useState<string | undefined>();

  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  // Redirect if already authenticated
  useEffect(() => {
    const reason = searchParams.get('reason');
    if (!isAuthenticated || !user) {
      if (reason === 'unauthorized') {
        return;
      }
    }

    if (isAuthenticated && user) {
      switch (user.role) {
        case 'student':
          router.push('/portal/student');
          break;
        case 'faculty':
          router.push('/portal/faculty');
          break;
        case 'admin':
          router.push('/portal/admin');
          break;
      }
    }
  }, [isAuthenticated, user, router, searchParams]);

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');
    setEmailNotVerified(false);
    setAccountLocked(false);
    setLoginEmail(data.email);

    try {
      const result = await login(data.email, data.password);

      if (result.success) {
        // Check if 2FA is required
        if (result.requires2FA) {
          setLoginStep('2fa');
        } else {
          setLoginStep('success');
          // Redirect will happen via useEffect
        }
      } else {
        // Handle specific error cases
        if (result.message.includes('verify your email') || result.message.includes('not verified')) {
          setEmailNotVerified(true);
          setError('');
        } else if (result.message.includes('locked') || result.message.includes('too many')) {
          setAccountLocked(true);
          setLockoutEndTime(result.lockoutEndTime);
          setError('');
        } else {
          setError(result.message);
        }
      }
    } catch (error: any) {
      if (error.response?.status === 423) {
        setAccountLocked(true);
        setLockoutEndTime(error.response?.data?.lockoutEndTime);
        setError('');
      } else if (error.response?.status === 403 && error.response?.data?.emailVerified === false) {
        setEmailNotVerified(true);
        setError('');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FASuccess = () => {
    setLoginStep('success');
    // Redirect will happen via useEffect
  };

  const handleBackToLogin = () => {
    setLoginStep('credentials');
    setError('');
    setEmailNotVerified(false);
    setAccountLocked(false);
  };

  const handleGoogleLogin = () => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://pccweb.onrender.com/api';
    window.location.href = `${apiBase}/auth/google`;
  };

  // Show 2FA step
  if (loginStep === '2fa') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center px-4 py-8">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md">
          <TwoFactorLoginStep
            email={loginEmail}
            onSuccess={handle2FASuccess}
            onBack={handleBackToLogin}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 relative overflow-hidden flex">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left Side - Branding */}
            <div className="hidden lg:block text-white space-y-8">
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="p-4 bg-white/10 backdrop-blur-md rounded-3xl mr-4 shadow-2xl">
                    <GraduationCap className="h-12 w-12 text-white" />
                  </div>
                  <div>
                    <h1 className="text-5xl font-bold">Passi City College</h1>
                    <p className="text-blue-200 text-xl">Excellence in Education</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-4xl font-light leading-tight">
                    Welcome to Your
                    <span className="block font-bold bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                      Academic Journey
                    </span>
                  </h2>
                  <p className="text-xl text-blue-100 leading-relaxed max-w-lg">
                    Access your courses, connect with faculty, and track your academic progress.
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4 max-w-lg">
                {[
                  'Comprehensive course materials',
                  'Real-time faculty communication',
                  'Track academic progress'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
                    <span className="text-blue-100">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full max-w-md mx-auto">
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
                {/* Header */}
                <div className="px-10 pt-10 pb-6 border-b border-gray-100">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                    <p className="text-gray-600 text-lg">Sign in to your account</p>
                  </div>
                </div>

                {/* Form */}
                <div className="px-10 py-6">
                  {/* Email Verification Required */}
                  {emailNotVerified && (
                    <div className="mb-6">
                      <EmailVerificationRequired email={loginEmail} />
                    </div>
                  )}

                  {/* Account Locked */}
                  {accountLocked && (
                    <div className="mb-6">
                      <AccountLockedMessage lockoutEndTime={lockoutEndTime} />
                    </div>
                  )}

                  {/* General Error */}
                  {error && !emailNotVerified && !accountLocked && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                      <p className="text-red-700 font-medium">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Email Field */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Email Address
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          {...register('email', {
                            required: 'Email is required',
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: 'Invalid email address',
                            },
                          })}
                          type="email"
                          className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all ${
                            errors.email ? 'border-red-300' : 'border-gray-200'
                          }`}
                          placeholder="your.email@example.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          {...register('password', {
                            required: 'Password is required',
                          })}
                          type={showPassword ? 'text' : 'password'}
                          className={`w-full pl-12 pr-12 py-4 border-2 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all ${
                            errors.password ? 'border-red-300' : 'border-gray-200'
                          }`}
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-red-600">{errors.password.message}</p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="animate-spin h-5 w-5 mr-2" />
                          Signing In...
                        </span>
                      ) : (
                        'Sign In'
                      )}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="my-8">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
                      </div>
                    </div>
                  </div>

                  {/* Google Login */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center px-6 py-4 border-2 border-gray-200 rounded-xl bg-white text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all shadow-sm hover:shadow-md"
                  >
                    <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </button>

                  {/* Register Link */}
                  <div className="mt-8 text-center space-y-4">
                    <p className="text-gray-600">
                      Don't have an account?{' '}
                      <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                        Create Account
                      </Link>
                    </p>
                    <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Back to Main Website
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EnhancedLogin() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-white" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
