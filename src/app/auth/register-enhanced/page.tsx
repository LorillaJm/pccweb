'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, GraduationCap, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  PasswordStrengthIndicator, 
  EmailValidationFeedback, 
  ReCaptchaWidget,
  RegistrationSuccess 
} from '@/components/auth';

interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  role: 'student' | 'faculty';
  studentId?: string;
  employeeId?: string;
  phone?: string;
}

export default function EnhancedRegister() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState<'student' | 'faculty'>('student');
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const router = useRouter();
  const { register: registerUser, isAuthenticated, user } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    defaultValues: {
      role: 'student'
    }
  });

  const watchPassword = watch('password');
  const watchEmail = watch('email');
  const watchRole = watch('role');

  useEffect(() => {
    setSelectedRole(watchRole || 'student');
  }, [watchRole]);

  // Redirect if already authenticated
  useEffect(() => {
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
  }, [isAuthenticated, user, router]);

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError('');

    // Validate reCAPTCHA
    if (!recaptchaToken) {
      setError('Please complete the reCAPTCHA verification');
      setIsLoading(false);
      return;
    }

    // Validate email
    if (!isEmailValid) {
      setError('Please use a valid email address');
      setIsLoading(false);
      return;
    }

    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...userData } = data;
      const result = await registerUser({
        ...userData,
        recaptchaToken
      } as any);

      if (result.success) {
        setRegisteredEmail(data.email);
        setRegistrationComplete(true);
      } else {
        // Handle rate limit errors
        if (result.message.includes('rate limit') || result.message.includes('Too many')) {
          setError('Too many registration attempts. Please try again later.');
        } else {
          setError(result.message);
        }
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        setError('Too many registration attempts. Please try again in a few minutes.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    // Implement resend logic
    console.log('Resend email to:', registeredEmail);
  };

  // Show success screen after registration
  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center px-4 py-8">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-2xl">
          <RegistrationSuccess
            email={registeredEmail}
            onResendEmail={handleResendEmail}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 relative overflow-hidden flex">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-12 items-center">

            {/* Left Side - Branding */}
            <div className="hidden lg:block lg:col-span-2 text-white space-y-8">
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
                    Join Our
                    <span className="block font-bold bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                      Academic Community
                    </span>
                  </h2>
                  <p className="text-xl text-blue-100 leading-relaxed max-w-lg">
                    Create your account and become part of our vibrant learning community.
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4 max-w-lg">
                {[
                  'Access to comprehensive course materials',
                  'Connect with expert faculty members',
                  'Track your academic progress',
                  'Join collaborative learning environment'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
                    <span className="text-blue-100">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="lg:col-span-3 w-full max-w-2xl mx-auto">
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 max-h-[calc(100vh-4rem)] flex flex-col">
                {/* Header */}
                <div className="px-10 pt-10 pb-6 border-b border-gray-100">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h2>
                    <p className="text-gray-600 text-lg">Join the PCC community</p>
                  </div>
                </div>

                {/* Scrollable Form */}
                <div className="flex-1 overflow-y-auto px-10 py-6">
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                      <p className="text-red-700 font-medium">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Role Selection */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-700">Account Type</label>
                      <div className="grid grid-cols-2 gap-4">
                        {['student', 'faculty'].map((role) => (
                          <label
                            key={role}
                            className={`relative flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all ${
                              selectedRole === role
                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <input
                              {...register('role', { required: 'Please select an account type' })}
                              type="radio"
                              value={role}
                              className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                              selectedRole === role ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                            }`}>
                              {selectedRole === role && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 capitalize">{role}</div>
                              <div className="text-sm text-gray-600">
                                {role === 'student' ? 'Enroll in courses' : 'Teach courses'}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">First Name *</label>
                        <input
                          {...register('firstName', { required: 'First name is required' })}
                          type="text"
                          className={`w-full px-4 py-4 border-2 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all ${
                            errors.firstName ? 'border-red-300' : 'border-gray-200'
                          }`}
                          placeholder="Enter first name"
                        />
                        {errors.firstName && (
                          <p className="text-sm text-red-600">{errors.firstName.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Last Name *</label>
                        <input
                          {...register('lastName', { required: 'Last name is required' })}
                          type="text"
                          className={`w-full px-4 py-4 border-2 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all ${
                            errors.lastName ? 'border-red-300' : 'border-gray-200'
                          }`}
                          placeholder="Enter last name"
                        />
                        {errors.lastName && (
                          <p className="text-sm text-red-600">{errors.lastName.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Email Address *</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
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
                      {watchEmail && !errors.email && (
                        <EmailValidationFeedback
                          email={watchEmail}
                          onValidationChange={setIsEmailValid}
                        />
                      )}
                    </div>

                    {/* Password Fields */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Password *</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            {...register('password', {
                              required: 'Password is required',
                              minLength: {
                                value: 8,
                                message: 'Password must be at least 8 characters',
                              },
                            })}
                            type={showPassword ? 'text' : 'password'}
                            className={`w-full pl-12 pr-12 py-4 border-2 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all ${
                              errors.password ? 'border-red-300' : 'border-gray-200'
                            }`}
                            placeholder="Create password"
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

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Confirm Password *</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            {...register('confirmPassword', {
                              required: 'Please confirm your password',
                              validate: (value) => value === watchPassword || 'Passwords do not match',
                            })}
                            type={showConfirmPassword ? 'text' : 'password'}
                            className={`w-full pl-12 pr-12 py-4 border-2 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all ${
                              errors.confirmPassword ? 'border-red-300' : 'border-gray-200'
                            }`}
                            placeholder="Confirm password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Password Strength Indicator */}
                    {watchPassword && (
                      <PasswordStrengthIndicator password={watchPassword} />
                    )}

                    {/* ID Fields */}
                    {selectedRole === 'student' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Student ID (Optional)
                        </label>
                        <input
                          {...register('studentId')}
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 2024-001"
                        />
                      </div>
                    )}

                    {selectedRole === 'faculty' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Employee ID (Optional)
                        </label>
                        <input
                          {...register('employeeId')}
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., FAC001"
                        />
                      </div>
                    )}

                    {/* reCAPTCHA */}
                    <div className="pt-4">
                      <ReCaptchaWidget
                        onVerify={setRecaptchaToken}
                        onError={() => setRecaptchaToken('')}
                        onExpire={() => setRecaptchaToken('')}
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading || !recaptchaToken}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Creating Account...
                        </span>
                      ) : (
                        'Create Account'
                      )}
                    </button>

                    {/* Login Link */}
                    <div className="text-center text-sm text-gray-600">
                      Already have an account?{' '}
                      <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                        Log in
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
