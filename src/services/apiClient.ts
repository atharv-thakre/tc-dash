import axios from 'axios';

const DEFAULT_BASE_URL = '/tc-auth';

export const LOCAL_STORAGE_TOKEN_KEY = 'tc_auth_access_token';
export const LOCAL_STORAGE_API_MODE_KEY = 'tc_auth_api_mode';
export const LOCAL_STORAGE_CUSTOM_URL_KEY = 'tc_auth_custom_url';

export type ApiMode = 'demo' | 'live';

export function getStoredApiMode(): ApiMode {
  const stored = localStorage.getItem(LOCAL_STORAGE_API_MODE_KEY);
  if (stored === 'live' || stored === 'demo') return stored;
  return 'demo'; // default to demo/mock so preview works instantly
}

export function setStoredApiMode(mode: ApiMode) {
  localStorage.setItem(LOCAL_STORAGE_API_MODE_KEY, mode);
}

export function getCustomBaseUrl(): string {
  return localStorage.getItem(LOCAL_STORAGE_CUSTOM_URL_KEY) || DEFAULT_BASE_URL;
}

export function setCustomBaseUrl(url: string) {
  localStorage.setItem(LOCAL_STORAGE_CUSTOM_URL_KEY, url);
}

export const apiClient = axios.create({
  baseURL: getCustomBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authorization header
apiClient.interceptors.request.use(
  (config) => {
    config.baseURL = getCustomBaseUrl();
    const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if unauthenticated
      // localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
    }
    return Promise.reject(error);
  }
);
