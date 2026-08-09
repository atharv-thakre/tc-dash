import {
  AuthResponse,
  LoginOTPInput,
  LoginPasswordInput,
  OTPPurpose,
  SendEmailOTPInput,
  SendEmailOTPResponse,
  SignupOTPInput,
  SignupPasswordInput,
} from '../types';
import { apiClient, getCustomBaseUrl, getStoredApiMode, LOCAL_STORAGE_TOKEN_KEY, requestWithFallback } from './apiClient';
import { INITIAL_ACCOUNTS } from './mockData';

// Local storage key for demo accounts
const DEMO_ACCOUNTS_KEY = 'tc_auth_demo_accounts';

export function getDemoAccounts() {
  const data = localStorage.getItem(DEMO_ACCOUNTS_KEY);
  if (!data) {
    localStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(INITIAL_ACCOUNTS));
    return INITIAL_ACCOUNTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_ACCOUNTS;
  }
}

export function saveDemoAccounts(accounts: any[]) {
  localStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(accounts));
}

function extractAuthResponse(resData: any): AuthResponse {
  const payload = resData?.data || resData || {};
  const access_token = payload.access_token || payload.token || payload.accessToken || payload.jwt || '';
  const token_type = payload.token_type || payload.tokenType || 'Bearer';
  const account = payload.account || payload.user || payload.account_data || payload.data?.account || payload.data?.user || null;

  return {
    access_token,
    token_type,
    account: account || {
      id: payload.id || 'acc_unknown',
      uid: payload.uid || 'uid_unknown',
      name: payload.name || 'User',
      handle: payload.handle || 'user',
      email: payload.email || '',
      phone: payload.phone || null,
      avatar_url: payload.avatar_url || null,
      role: payload.role || 'user',
      status: payload.status || 'active',
      created_at: payload.created_at || new Date().toISOString(),
      updated_at: payload.updated_at || new Date().toISOString(),
    },
  };
}

export const authService = {
  // POST /send/email/otp/{purpose}
  async sendEmailOTP(purpose: OTPPurpose, input: SendEmailOTPInput): Promise<SendEmailOTPResponse> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const expires_at = new Date(Date.now() + 1000 * 60 * 10).toISOString();
      return { expires_at };
    }
    const resData = await requestWithFallback<any>('post', [
      `/send/email/otp/${purpose}`,
      `/send/email/otp/${purpose}/`,
      `/otp/send/${purpose}`,
    ], input);
    return resData?.data || resData;
  },

  // POST /signup/otp
  async signupOTP(input: SignupOTPInput): Promise<AuthResponse> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const accounts = getDemoAccounts();
      const newAcc = {
        id: `acc_${Date.now()}`,
        uid: `uid_${Date.now()}`,
        name: input.name,
        handle: input.handle || input.email.split('@')[0],
        email: input.email,
        phone: null,
        avatar_url: null,
        role: 'user' as const,
        status: 'active' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      accounts.push(newAcc);
      saveDemoAccounts(accounts);

      const response: AuthResponse = {
        access_token: `tc_demo_token_${newAcc.id}_${Date.now()}`,
        token_type: 'Bearer',
        account: newAcc,
      };
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, response.access_token);
      return response;
    }
    const resData = await requestWithFallback<any>('post', ['/signup/otp', '/signup/otp/', '/auth/signup/otp'], input);
    const authRes = extractAuthResponse(resData);
    if (authRes.access_token) {
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, authRes.access_token);
    }
    return authRes;
  },

  // POST /signup/password
  async signupPassword(input: SignupPasswordInput): Promise<AuthResponse> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const accounts = getDemoAccounts();
      const existing = accounts.find(
        (a: any) => a.email.toLowerCase() === input.email.toLowerCase() || a.handle === input.handle
      );
      if (existing) {
        throw new Error('Account with this email or handle already exists');
      }

      const newAcc = {
        id: `acc_${Date.now()}`,
        uid: `uid_${Date.now()}`,
        name: input.name,
        handle: input.handle,
        email: input.email,
        phone: null,
        avatar_url: null,
        role: 'user' as const,
        status: 'active' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      accounts.push(newAcc);
      saveDemoAccounts(accounts);

      const response: AuthResponse = {
        access_token: `tc_demo_token_${newAcc.id}_${Date.now()}`,
        token_type: 'Bearer',
        account: newAcc,
      };
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, response.access_token);
      return response;
    }
    const resData = await requestWithFallback<any>('post', ['/signup/password', '/signup/password/', '/auth/signup/password'], input);
    const authRes = extractAuthResponse(resData);
    if (authRes.access_token) {
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, authRes.access_token);
    }
    return authRes;
  },

  // POST /login/otp
  async loginOTP(input: LoginOTPInput): Promise<AuthResponse> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const accounts = getDemoAccounts();
      let acc = accounts.find((a: any) => a.email.toLowerCase() === input.email.toLowerCase());
      if (!acc) {
        acc = {
          id: `acc_${Date.now()}`,
          uid: `uid_${Date.now()}`,
          name: input.email.split('@')[0],
          handle: input.email.split('@')[0],
          email: input.email,
          phone: null,
          avatar_url: null,
          role: 'user' as const,
          status: 'active' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        accounts.push(acc);
        saveDemoAccounts(accounts);
      }

      const response: AuthResponse = {
        access_token: `tc_demo_token_${acc.id}_${Date.now()}`,
        token_type: 'Bearer',
        account: acc,
      };
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, response.access_token);
      return response;
    }
    const resData = await requestWithFallback<any>('post', ['/login/otp', '/login/otp/', '/auth/login/otp'], input);
    const authRes = extractAuthResponse(resData);
    if (authRes.access_token) {
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, authRes.access_token);
    }
    return authRes;
  },

  // POST /login/password
  async loginPassword(input: LoginPasswordInput): Promise<AuthResponse> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const accounts = getDemoAccounts();
      const acc = accounts.find(
        (a: any) =>
          a.email.toLowerCase() === input.identifier.toLowerCase() ||
          a.handle.toLowerCase() === input.identifier.toLowerCase()
      );

      if (!acc) {
        throw new Error('Invalid email/handle or password');
      }

      const response: AuthResponse = {
        access_token: `tc_demo_token_${acc.id}_${Date.now()}`,
        token_type: 'Bearer',
        account: acc,
      };
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, response.access_token);
      return response;
    }

    const resData = await requestWithFallback<any>('post', [
      '/login/password',
      '/login/password/',
      '/auth/login/password',
      '/login',
      '/login/',
    ], input);

    const authRes = extractAuthResponse(resData);
    if (authRes.access_token) {
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, authRes.access_token);
    }
    return authRes;
  },

  getOAuthLoginUrl(provider: 'google' | 'github'): string {
    return `${getCustomBaseUrl()}/${provider}/login`;
  },
};
