import { MeResponse, UpdatePasswordInput } from '../types';
import { apiClient, getStoredApiMode, LOCAL_STORAGE_TOKEN_KEY } from './apiClient';
import { getDemoAccounts } from './auth';

export const profileService = {
  // GET /me
  async getMe(): Promise<MeResponse> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
      const accounts = getDemoAccounts();

      let matchedAccount = accounts[0]; // Default to superadmin for demo
      if (token) {
        const found = accounts.find((a: any) => token.includes(a.id));
        if (found) matchedAccount = found;
      }

      return {
        account: matchedAccount,
        session: {
          id: `sess_current_${matchedAccount.id}`,
          account_id: matchedAccount.id,
          ip_address: '127.0.0.1',
          user_agent: 'tc-auth Control Panel (Browser Client)',
          expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
          created_at: new Date().toISOString(),
        },
        payload: {
          sub: matchedAccount.id,
          role: matchedAccount.role,
          handle: matchedAccount.handle,
          iss: 'tc-auth',
        },
      };
    }

    const res = await apiClient.get<MeResponse>('/me');
    return res.data;
  },

  // POST /logout
  async logout(): Promise<null> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 200));
      localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
      return null;
    }

    try {
      await apiClient.post('/logout');
    } finally {
      localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
    }
    return null;
  },

  // POST /logout-all
  async logoutAll(): Promise<null> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
      return null;
    }

    try {
      await apiClient.post('/logout-all');
    } finally {
      localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
    }
    return null;
  },

  // PUT /update/password
  async updatePassword(input: UpdatePasswordInput): Promise<null> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return null;
    }

    const res = await apiClient.put('/update/password', input);
    return res.data;
  },
};
