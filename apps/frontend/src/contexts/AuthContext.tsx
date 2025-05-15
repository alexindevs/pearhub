'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { login as loginAPI, signup as signupAPI } from '@/lib/api/auth.client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type Role = 'MEMBER' | 'BUSINESS';

type User = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  role: Role;
};

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

type LoginInput = { email: string; password: string };
export type SignupInput = {
  name: string;
  email: string;
  password: string;
  role: Role;
  businessName?: string;
};

type AuthContextType = {
  authState: AuthState;
  login: (data: LoginInput) => Promise<User>;
  signup: (data: SignupInput) => Promise<void>;
  logout: () => void;
  isBusinessOwner: () => boolean;
  isMember: () => boolean;
};

const initialAuthState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('pearhub_auth');
    if (saved) {
      const parsed = JSON.parse(saved);
      setAuthState({
        user: parsed.user,
        token: parsed.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const saveToStorage = (user: User, token: string) => {
    localStorage.setItem('pearhub_auth', JSON.stringify({ user, token }));
  };

  const login = async ({ email, password }: LoginInput) => {
    try {
      const res = await loginAPI(email, password);
      setAuthState({
        user: res.user,
        token: res.token,
        isAuthenticated: true,
        isLoading: false,
      });
      saveToStorage(res.user, res.token);

      toast.success(`Welcome back! Logged in as ${res.user.name}`);
      return res.user;
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Invalid email or password';
      toast.error('Login failed! ' + message);
      throw err;
    }
  };

  const signup = async (data: SignupInput) => {
    try {
      const res = await signupAPI(data);
      setAuthState({
        user: res.user,
        token: res.token,
        isAuthenticated: true,
        isLoading: false,
      });
      saveToStorage(res.user, res.token);

      toast.success(`Welcome! You are now signed up as ${res.user.name}`);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.errors?.[0]?.message ||
        err?.response?.data?.message ||
        'Signup failed';

      toast.error('Signup failed! ' + errorMsg);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('pearhub_auth');
    setAuthState({ ...initialAuthState, isLoading: false });
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const isBusinessOwner = () => authState.user?.role === 'BUSINESS';
  const isMember = () => authState.user?.role === 'MEMBER';

  return (
    <AuthContext.Provider
      value={{
        authState,
        login,
        signup,
        logout,
        isBusinessOwner,
        isMember,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
