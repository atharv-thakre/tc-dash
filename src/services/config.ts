import { ConfigPayload, EmailConfig, JWTConfig, OAuthConfig } from '../types';
import { apiClient, getStoredApiMode, requestWithFallback } from './apiClient';
import { INITIAL_CONFIG } from './mockData';

const DEMO_CONFIG_KEY = 'tc_auth_demo_config';

function getDemoConfig(): ConfigPayload {
  const data = localStorage.getItem(DEMO_CONFIG_KEY);
  if (!data) {
    localStorage.setItem(DEMO_CONFIG_KEY, JSON.stringify(INITIAL_CONFIG));
    return INITIAL_CONFIG;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_CONFIG;
  }
}

function saveDemoConfig(config: ConfigPayload) {
  localStorage.setItem(DEMO_CONFIG_KEY, JSON.stringify(config));
}

export const configService = {
  // GET /config/load/
  async loadConfig(): Promise<ConfigPayload> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return getDemoConfig();
    }
    const resData = await requestWithFallback<any>('get', [
      '/config/load/',
      '/config/load',
      '/config/',
      '/config',
    ]);
    return resData?.data || resData;
  },

  // POST /config/email
  async updateEmailConfig(input: EmailConfig): Promise<null> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const conf = getDemoConfig();
      conf.email = { ...conf.email, ...input };
      saveDemoConfig(conf);
      return null;
    }
    const resData = await requestWithFallback<any>('post', ['/config/email', '/config/email/'], input);
    return resData?.data || resData;
  },

  // POST /config/github
  async updateGithubConfig(input: OAuthConfig): Promise<null> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const conf = getDemoConfig();
      conf.github = { ...conf.github, ...input };
      saveDemoConfig(conf);
      return null;
    }
    const resData = await requestWithFallback<any>('post', ['/config/github', '/config/github/'], input);
    return resData?.data || resData;
  },

  // POST /config/google
  async updateGoogleConfig(input: OAuthConfig): Promise<null> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const conf = getDemoConfig();
      conf.google = { ...conf.google, ...input };
      saveDemoConfig(conf);
      return null;
    }
    const resData = await requestWithFallback<any>('post', ['/config/google', '/config/google/'], input);
    return resData?.data || resData;
  },

  // POST /config/jwt
  async updateJwtConfig(input: JWTConfig): Promise<null> {
    if (getStoredApiMode() === 'demo') {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const conf = getDemoConfig();
      conf.jwt = { ...conf.jwt, ...input };
      saveDemoConfig(conf);
      return null;
    }
    const resData = await requestWithFallback<any>('post', ['/config/jwt', '/config/jwt/'], input);
    return resData?.data || resData;
  },
};
