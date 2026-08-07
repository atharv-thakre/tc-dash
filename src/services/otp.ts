import { CreateOTPInput, CreateOTPResponse, DeleteOTPInput, OTPRecord } from '../types';
import { apiClient, getStoredApiMode } from './apiClient';
import { INITIAL_OTP_RECORDS } from './mockData';

const DEMO_OTP_RECORDS_KEY = 'tc_auth_demo_otp_records';

function getDemoOTPRecords(): OTPRecord[] {
  const data = localStorage.getItem(DEMO_OTP_RECORDS_KEY);
  if (!data) {
    localStorage.setItem(DEMO_OTP_RECORDS_KEY, JSON.stringify(INITIAL_OTP_RECORDS));
    return INITIAL_OTP_RECORDS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_OTP_RECORDS;
  }
}

function saveDemoOTPRecords(records: OTPRecord[]) {
  localStorage.setItem(DEMO_OTP_RECORDS_KEY, JSON.stringify(records));
}

export const otpService = {
  // GET /otp/
  async listRecords(): Promise<OTPRecord[]> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return getDemoOTPRecords();
    }
    const res = await apiClient.get<OTPRecord[]>('/otp/');
    return res.data;
  },

  // POST /otp/
  async createOTP(input: CreateOTPInput): Promise<CreateOTPResponse> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const records = getDemoOTPRecords();
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expires_at = new Date(Date.now() + (input.expires || 600) * 1000).toISOString();

      const newRecord: OTPRecord = {
        id: `otp_${Date.now()}`,
        identifier: input.identifier,
        purpose: input.purpose,
        code_hash: `$2a$12$demo_hash_${generatedCode}`,
        attempts: 0,
        expires_at,
        created_at: new Date().toISOString(),
      };

      records.unshift(newRecord);
      saveDemoOTPRecords(records);

      return {
        otp: generatedCode,
        expires_at,
      };
    }
    const res = await apiClient.post<CreateOTPResponse>('/otp/', input);
    return res.data;
  },

  // DELETE /otp/
  async deleteOTP(input: DeleteOTPInput): Promise<boolean> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let records = getDemoOTPRecords();
      const initialCount = records.length;
      records = records.filter(
        (r) => !(r.identifier === input.identifier && r.purpose.toLowerCase() === input.purpose.toLowerCase())
      );
      saveDemoOTPRecords(records);
      return records.length < initialCount;
    }
    const res = await apiClient.delete<boolean>('/otp/', { data: input });
    return res.data;
  },

  // DELETE /otp/cleanup
  async cleanupExpired(): Promise<{ count: number }> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let records = getDemoOTPRecords();
      const now = new Date().getTime();
      const initialCount = records.length;
      records = records.filter((r) => new Date(r.expires_at).getTime() > now);
      saveDemoOTPRecords(records);
      return { count: initialCount - records.length };
    }
    const res = await apiClient.delete<{ count: number }>('/otp/cleanup');
    return res.data;
  },

  // DELETE /otp/clear
  async clearAll(): Promise<null> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      saveDemoOTPRecords([]);
      return null;
    }
    const res = await apiClient.delete('/otp/clear');
    return res.data;
  },
};
