import React, { createContext, useContext, useEffect, useState } from 'react';
import { LOCAL_STORAGE_TOKEN_KEY } from '../services/apiClient';
import { authService } from '../services/auth';
import { profileService } from '../services/profile';
import {
  Account,
  LoginOTPInput,
  LoginPasswordInput,
  SessionInfo,
  SignupOTPInput,
  SignupPasswordInput,
} from '../types';
import { useApiConfig } from './ApiConfigContext';

interface AuthContextType {
  account: Account | null;
  session: SessionInfo | null;
  payload: Record<string, unknown> | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  loginPassword: (input: LoginPasswordInput) => Promise<void>;
  loginOTP: (input: LoginOTPInput) => Promise<void>;
  signupPassword: (input: SignupPasswordInput) => Promise<void>;
  signupOTP: (input: SignupOTPInput) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refetchMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<Account | null>(null);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [payload, setPayload] = useState<Record<string, unknown> | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { apiMode } = useApiConfig();

  const fetchMe = async () => {
    setIsLoading(true);
    try {
      const data = await profileService.getMe();
      setAccount(data.account);
      setSession(data.session || null);
      setPayload(data.payload || null);
    } catch {
      // If error fetching profile, reset user state
      setAccount(null);
      setSession(null);
      setPayload(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, [apiMode]);

  const loginPassword = async (input: LoginPasswordInput) => {
    const res = await authService.loginPassword(input);
    setToken(res.access_token);
    setAccount(res.account);
    await fetchMe();
  };

  const loginOTP = async (input: LoginOTPInput) => {
    const res = await authService.loginOTP(input);
    setToken(res.access_token);
    setAccount(res.account);
    await fetchMe();
  };

  const signupPassword = async (input: SignupPasswordInput) => {
    const res = await authService.signupPassword(input);
    setToken(res.access_token);
    setAccount(res.account);
    await fetchMe();
  };

  const signupOTP = async (input: SignupOTPInput) => {
    const res = await authService.signupOTP(input);
    setToken(res.access_token);
    setAccount(res.account);
    await fetchMe();
  };

  const logout = async () => {
    await profileService.logout();
    setToken(null);
    setAccount(null);
    setSession(null);
    setPayload(null);
  };

  const logoutAll = async () => {
    await profileService.logoutAll();
    setToken(null);
    setAccount(null);
    setSession(null);
    setPayload(null);
  };

  const isSuperAdmin = account?.role === 'superadmin';
  const isAuthenticated = !!account;

  return (
    <AuthContext.Provider
      value={{
        account,
        session,
        payload,
        token,
        isLoading,
        isAuthenticated,
        isSuperAdmin,
        loginPassword,
        loginOTP,
        signupPassword,
        signupOTP,
        logout,
        logoutAll,
        refetchMe: fetchMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
