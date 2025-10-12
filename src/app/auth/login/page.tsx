'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, GraduationCap, Loader2, User, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface LoginForm {
  email: string;
  password: string;
}

function LoginContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, user } = useAuth();
  const { t } = useLanguage();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  // Redirect if already authenticated
  useEffect(() => {
    // Suppress redirect only when not authenticated
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

    try {
      const result = await login(data.email, data.password);
      
      if (result.success) {
        // Redirect will happen via useEffect above
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    window.location.href = `${apiBase}/auth/google`;
  };

  const handleAppleLogin = () => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    window.location.href = `${apiBase}/auth/apple`;
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 relative overflow-hidden flex">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 to-transparent"></div>
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400/5 rounded-full blur-3xl"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full flex items-center justify-center px-4 py-4 sm:py-6 lg:py-8">
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-start lg:items-center h-full">
            
            {/* Left Side - Branding & Info */}
            <div className="hidden lg:block text-left text-white space-y-6 xl:space-y-8">
              {/* Logo & Title */}
              <div className="space-y-4 xl:space-y-6">
                <div className="flex items-center">
                  <div className="p-3 xl:p-4 bg-white/10 backdrop-blur-md rounded-3xl mr-3 xl:mr-4 shadow-2xl">
                    <GraduationCap className="h-10 w-10 xl:h-12 xl:w-12 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl xl:text-5xl font-bold">Passi City College</h1>
                    <p className="text-blue-200 text-lg xl:text-xl">Excellence in Education</p>
                  </div>
                </div>
                
                <div className="space-y-3 xl:space-y-4">
                  <h2 className="text-2xl xl:text-4xl font-light leading-tight">
                    Welcome to Your
                    <span className="block font-bold bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                      Academic Journey
                    </span>
                  </h2>
                  <p className="text-lg xl:text-xl text-blue-100 leading-relaxed max-w-lg">
                    Access your courses, connect with faculty, and track your academic progress in one unified platform.
                  </p>
                </div>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 xl:gap-6 max-w-md">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 xl:p-6 text-center shadow-xl">
                  <div className="text-2xl xl:text-3xl font-bold text-yellow-300">500+</div>
                  <div className="text-blue-200 text-sm xl:text-base mt-1">Active Students</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 xl:p-6 text-center shadow-xl">
                  <div className="text-2xl xl:text-3xl font-bold text-yellow-300">50+</div>
                  <div className="text-blue-200 text-sm xl:text-base mt-1">Expert Faculty</div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 xl:space-y-4 max-w-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
                  <span className="text-blue-100 text-sm xl:text-base">Comprehensive course materials and resources</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
                  <span className="text-blue-100 text-sm xl:text-base">Real-time communication with faculty</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
                  <span className="text-blue-100 text-sm xl:text-base">Track academic progress and achievements</span>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full max-w-md mx-auto h-full flex items-center">
              {/* Login Card with Scrollable Content */}
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 w-full max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] lg:max-h-[calc(100vh-4rem)] flex flex-col">
                {/* Fixed Header */}
                <div className="px-6 sm:px-8 lg:px-10 pt-6 sm:pt-8 lg:pt-10 pb-4 sm:pb-6 border-b border-gray-100">
                  <div className="text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t('auth.login.title')}</h2>
                    <p className="text-gray-600 text-base sm:text-lg">{t('auth.login.subtitle')}</p>
                  </div>
                </div>

                {/* Scrollable Form Content */}
                <div className="flex-1 overflow-y-auto px-6 sm:px-8 lg:px-10 py-4 sm:py-6">{/* Custom scrollbar styles */}
                  <style jsx>{`
                    .overflow-y-auto::-webkit-scrollbar {
                      width: 6px;
                    }
                    .overflow-y-auto::-webkit-scrollbar-track {
                      background: #f1f1f1;
                      border-radius: 10px;
                    }
                    .overflow-y-auto::-webkit-scrollbar-thumb {
                      background: #cbd5e1;
                      border-radius: 10px;
                    }
                    .overflow-y-auto::-webkit-scrollbar-thumb:hover {
                      background: #94a3b8;
                    }
                  `}</style>

                  {error && (
                    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-red-700 font-medium text-sm sm:text-base">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                    {/* Email Field */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                        {t('auth.login.email')}
                      </label>
                      <div className="relative group">
                        <User className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                        <input
                          {...register('email', {
                            required: 'Email is required',
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: 'Invalid email address',
                            },
                          })}
                          type="email"
                          id="email"
                          className={`w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-0 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base ${
                            errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          placeholder="your.email@example.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-xs sm:text-sm text-red-600 flex items-center mt-1">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                      <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                        Password
                      </label>
                      <div className="relative group">
                        <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                        <input
                          {...register('password', {
                            required: 'Password is required',
                            minLength: {
                              value: 6,
                              message: 'Password must be at least 6 characters',
                            },
                          })}
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          className={`w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 border-2 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-0 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base ${
                            errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-xs sm:text-sm text-red-600 flex items-center mt-1">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.password.message}
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500/25 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl flex items-center justify-center"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                          {t('auth.login.signingIn')}
                        </>
                      ) : (
                        t('auth.login.submit')
                      )}
                    </button>
                  </form>

                  {/* Divider */}
                  {/* Social Login Buttons - Temporarily disabled until backend is deployed */}
                  {false && (
                    <>
                      <div className="my-6 sm:my-8">
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                          </div>
                          <div className="relative flex justify-center text-xs sm:text-sm">
                            <span className="px-3 sm:px-4 bg-white text-gray-500 font-medium">Or continue with</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 sm:space-y-4">
                        {/* Google Login */}
                        <button
                          type="button"
                          onClick={handleGoogleLogin}
                          className="w-full flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 border-2 border-gray-200 rounded-xl bg-white text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-200/50 transform hover:scale-[1.02] transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base"
                        >
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          Continue with Google
                        </button>

                        {/* Apple Login */}
                        <button
                          type="button"
                          onClick={handleAppleLogin}
                          className="w-full flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 border-2 border-gray-900 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 hover:border-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-900/25 transform hover:scale-[1.02] transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base"
                        >
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                          </svg>
                          Continue with Apple
                        </button>
                      </div>
                    </>
                  )}

                  {/* Demo Accounts */}
                  <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <div className="flex items-center mb-3">
                      <div className="p-1 bg-blue-100 rounded-lg mr-2">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h3 className="text-xs sm:text-sm font-semibold text-blue-900">Demo Accounts</h3>
                    </div>
                    <div className="text-xs sm:text-sm text-blue-800 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                        <span className="font-medium">Student:</span>
                        <code className="text-[10px] sm:text-xs bg-white px-2 py-1 rounded break-all">anna.garcia@student.pcc.edu.ph</code>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                        <span className="font-medium">Faculty:</span>
                        <code className="text-[10px] sm:text-xs bg-white px-2 py-1 rounded break-all">maria.santos@passicitycollege.edu.ph</code>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                        <span className="font-medium">Admin:</span>
                        <code className="text-[10px] sm:text-xs bg-white px-2 py-1 rounded break-all">admin@passicitycollege.edu.ph</code>
                      </div>
                      <div className="text-center pt-2 border-t border-blue-200">
                        <span className="text-[10px] sm:text-xs text-blue-600">Password: <code className="bg-white px-1 rounded">password123</code></span>
                      </div>
                    </div>
                  </div>

                  {/* Register Link */}
                  <div className="mt-6 sm:mt-8 text-center space-y-3 sm:space-y-4">
                    <p className="text-sm sm:text-base text-gray-600">
                      Don't have an account?{' '}
                      <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-all">
                        Create Account
                      </Link>
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Or use Google/Apple to create an account automatically
                    </p>
                  </div>

                  {/* Back to Website */}
                  <div className="mt-4 sm:mt-6 text-center pb-2">
                    <Link href="/" className="inline-flex items-center text-xs sm:text-sm text-gray-500 hover:text-gray-700 transition-colors">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

export default function Login() {
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