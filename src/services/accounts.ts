import { Account, CreateAccountInput, PatchAccountInput } from '../types';
import { apiClient, getStoredApiMode } from './apiClient';
import { getDemoAccounts, saveDemoAccounts } from './auth';

export const accountsService = {
  // GET /account/
  async listAccounts(): Promise<Account[]> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return getDemoAccounts();
    }
    const res = await apiClient.get<Account[]>('/account/');
    return res.data;
  },

  // POST /account/
  async createAccount(input: CreateAccountInput): Promise<Account> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const accounts = getDemoAccounts();
      const newAcc: Account = {
        id: `acc_${Date.now()}`,
        uid: `uid_${Date.now()}`,
        name: input.name,
        email: input.email,
        handle: input.handle,
        phone: input.phone || null,
        avatar_url: input.avatar_url || null,
        role: input.role,
        status: input.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      accounts.unshift(newAcc);
      saveDemoAccounts(accounts);
      return newAcc;
    }
    const res = await apiClient.post<Account>('/account/', input);
    return res.data;
  },

  // PATCH /account/
  async updateAccount(input: PatchAccountInput): Promise<Account> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const accounts = getDemoAccounts();
      const idx = accounts.findIndex((a: Account) => a.id === input.account_id);
      if (idx === -1) throw new Error('Account not found');

      const updated = {
        ...accounts[idx],
        ...input,
        updated_at: new Date().toISOString(),
      };
      accounts[idx] = updated;
      saveDemoAccounts(accounts);
      return updated;
    }
    const res = await apiClient.patch<Account>('/account/', input);
    return res.data;
  },

  // DELETE /account/
  async deleteAccount(account_id: string): Promise<null> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 400));
      let accounts = getDemoAccounts();
      accounts = accounts.filter((a: Account) => a.id !== account_id);
      saveDemoAccounts(accounts);
      return null;
    }
    const res = await apiClient.delete('/account/', { data: { account_id } });
    return res.data;
  },
};
