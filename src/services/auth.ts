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
import { apiClient, getCustomBaseUrl, getStoredApiMode, LOCAL_STORAGE_TOKEN_KEY } from './apiClient';
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

export const authService = {
  // POST /send/email/otp/{purpose}
  async sendEmailOTP(purpose: OTPPurpose, input: SendEmailOTPInput): Promise<SendEmailOTPResponse> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const expires_at = new Date(Date.now() + 1000 * 60 * 10).toISOString();
      return { expires_at };
    }
    const res = await apiClient.post<SendEmailOTPResponse>(`/send/email/otp/${purpose}`, input);
    return res.data;
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
    const res = await apiClient.post<AuthResponse>('/signup/otp', input);
    if (res.data.access_token) {
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, res.data.access_token);
    }
    return res.data;
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
    const res = await apiClient.post<AuthResponse>('/signup/password', input);
    if (res.data.access_token) {
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, res.data.access_token);
    }
    return res.data;
  },

  // POST /login/otp
  async loginOTP(input: LoginOTPInput): Promise<AuthResponse> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const accounts = getDemoAccounts();
      let acc = accounts.find((a: any) => a.email.toLowerCase() === input.email.toLowerCase());
      if (!acc) {
        // Create demo account if logging in with new email via demo OTP
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
    const res = await apiClient.post<AuthResponse>('/login/otp', input);
    if (res.data.access_token) {
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, res.data.access_token);
    }
    return res.data;
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

    const res = await apiClient.post<AuthResponse>('/login/password', input);
    if (res.data.access_token) {
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, res.data.access_token);
    }
    return res.data;
  },

  getOAuthLoginUrl(provider: 'google' | 'github'): string {
    return `${getCustomBaseUrl()}/${provider}/login`;
  },
};
