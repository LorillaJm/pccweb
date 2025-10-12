'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { authApi, User, StudentProfile, FacultyProfile } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  profile: StudentProfile | FacultyProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  role: 'student' | 'faculty' | 'admin' | 'super_admin';
  studentId?: string;
  employeeId?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | FacultyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check for existing session on mount
  useEffect(() => {
    let isMounted = true;
    
    const initAuth = async () => {
      if (isMounted) {
        await checkAuthStatus();
      }
    };
    
    initAuth();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const checkAuthStatus = async () => {
    const maxAttempts = 4;
    let attempt = 0;
    let lastError: any = null;
    let finished = false;

    setIsLoading(true);

    while (attempt < maxAttempts && !finished) {
      try {
        if (attempt > 0) {
          const backoffMs = 300 * Math.pow(2, attempt - 1);
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
        }

        console.log('Checking auth status...');
        const response = await authApi.getCurrentUser();
        console.log('Auth response:', response);
        if (response.success) {
          setUser(response.data.user);
          setProfile(response.data.profile);
          console.log('User authenticated:', response.data.user);
        }
        finished = true;
      } catch (error: any) {
        lastError = error;
        const status = error?.response?.status;
        const isNetworkError = !error?.response;
        const sessionStatus = error?.response?.data?.sessionStatus;
        
        // For 429, retry with backoff without clearing user state
        if (status === 429 || isNetworkError) {
          attempt += 1;
          continue;
        }

        // Handle different types of authentication errors
        if (status === 401) {
          console.log('Authentication failed:', error?.response?.data?.message || 'Session invalid');
          if (sessionStatus === 'expired') {
            console.log('Session expired, clearing auth state');
          } else if (sessionStatus === 'invalid') {
            console.log('Session invalid, clearing auth state');
          }
        } else if (status === 403) {
          console.log('Account access forbidden:', error?.response?.data?.message);
        } else {
          console.error('Auth check failed:', error);
        }
        
        // Clear user state for auth failures
        setUser(null);
        setProfile(null);
        finished = true;
      }
    }

    if (!finished && lastError) {
      console.warn('Auth check gave up after retries due to rate limiting. Keeping current auth state.');
    }

    setIsLoading(false);
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    const maxAttempts = 3;
    let attempt = 0;
    setIsLoading(true);

    try {
      while (attempt < maxAttempts) {
        try {
          if (attempt > 0) {
            const backoffMs = 300 * Math.pow(2, attempt - 1);
            await new Promise((resolve) => setTimeout(resolve, backoffMs));
          }

          const response = await authApi.login(email, password);

          if (response.success) {
            const { user } = response.data;
            setUser(user);

            // Fetch full profile
            await refetchUser();

            return { success: true, message: 'Login successful' };
          } else {
            return { success: false, message: response.message };
          }
        } catch (error: any) {
          const status = error?.response?.status;
          if (status === 429) {
            attempt += 1;
            continue;
          }
          console.error('Login error:', error);
          const message = error.response?.data?.message || 'Login failed. Please try again.';
          return { success: false, message };
        }
      }

      return { success: false, message: 'Too many attempts. Please try again shortly.' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      const response = await authApi.register(userData);
      
      if (response.success) {
        const { user } = response.data;
        setUser(user);
        
        // Fetch full profile
        await refetchUser();
        
        return { success: true, message: 'Registration successful' };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state regardless of API call result
      setUser(null);
      setProfile(null);
    }
  };

  const refetchUser = async (): Promise<void> => {
    try {
      const response = await authApi.getCurrentUser();
      if (response.success) {
        setUser(response.data.user);
        setProfile(response.data.profile);
      }
    } catch (error) {
      console.error('Failed to refetch user:', error);
    }
  };

  const token = null; // Session-based auth doesn't use tokens

  const value: AuthContextType = {
    user,
    profile,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refetchUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext };