import { SessionRecord } from '../types';
import { apiClient, getStoredApiMode } from './apiClient';
import { INITIAL_SESSIONS } from './mockData';

const DEMO_SESSIONS_KEY = 'tc_auth_demo_sessions';

function getDemoSessions(): SessionRecord[] {
  const data = localStorage.getItem(DEMO_SESSIONS_KEY);
  if (!data) {
    localStorage.setItem(DEMO_SESSIONS_KEY, JSON.stringify(INITIAL_SESSIONS));
    return INITIAL_SESSIONS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_SESSIONS;
  }
}

function saveDemoSessions(sessions: SessionRecord[]) {
  localStorage.setItem(DEMO_SESSIONS_KEY, JSON.stringify(sessions));
}

export const sessionsService = {
  // GET /session/
  async listSessions(): Promise<SessionRecord[]> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return getDemoSessions();
    }
    const res = await apiClient.get<SessionRecord[]>('/session/');
    return res.data;
  },

  // DELETE /session/
  async deleteSession(session_id: string): Promise<null> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let sessions = getDemoSessions();
      sessions = sessions.filter((s) => s.id !== session_id);
      saveDemoSessions(sessions);
      return null;
    }
    const res = await apiClient.delete('/session/', { data: { session_id } });
    return res.data;
  },

  // DELETE /session/all
  async deleteAllForAccount(account_id: string): Promise<null> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let sessions = getDemoSessions();
      sessions = sessions.filter((s) => s.account_id !== account_id);
      saveDemoSessions(sessions);
      return null;
    }
    const res = await apiClient.delete('/session/all', { data: { account_id } });
    return res.data;
  },

  // DELETE /session/cleanup
  async cleanupExpired(): Promise<null> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let sessions = getDemoSessions();
      const now = new Date().getTime();
      sessions = sessions.filter((s) => new Date(s.expires_at).getTime() > now);
      saveDemoSessions(sessions);
      return null;
    }
    const res = await apiClient.delete('/session/cleanup');
    return res.data;
  },

  // DELETE /session/clear
  async clearAll(): Promise<null> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      saveDemoSessions([]);
      return null;
    }
    const res = await apiClient.delete('/session/clear');
    return res.data;
  },
};
