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
  const url = localStorage.getItem(LOCAL_STORAGE_CUSTOM_URL_KEY) || DEFAULT_BASE_URL;
  if (!url || !url.trim()) return DEFAULT_BASE_URL;
  const trimmed = url.trim();
  // Ensure no trailing slashes for clean concatenation with endpoint paths
  return trimmed.endsWith('/') && trimmed.length > 1 ? trimmed.replace(/\/+$/, '') : trimmed;
}

export function setCustomBaseUrl(url: string) {
  const cleaned = url ? url.trim().replace(/\/+$/, '') : DEFAULT_BASE_URL;
  localStorage.setItem(LOCAL_STORAGE_CUSTOM_URL_KEY, cleaned || DEFAULT_BASE_URL);
}

export const apiClient = axios.create({
  baseURL: getCustomBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authorization header and dynamic base URL
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
    }
    return Promise.reject(error);
  }
);

export interface PaginatedResult<T> {
  items: T[];
  total?: number;
}

/**
 * Safely extracts an array and optional total count from various API response shapes.
 */
export function normalizePaginatedResponse<T>(data: any): PaginatedResult<T> {
  const items = normalizeArrayResponse<T>(data);
  let total: number | undefined = undefined;

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    if (typeof data.total === 'number') total = data.total;
    else if (typeof data.total_count === 'number') total = data.total_count;
    else if (typeof data.totalCount === 'number') total = data.totalCount;
    else if (typeof data.count === 'number') total = data.count;
  }

  return { items, total };
}

/**
 * Safely extracts an array from various API response shapes (wrapped vs raw array).
 */
export function normalizeArrayResponse<T>(data: any): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'object') {
    const keysToCheck = [
      'data',
      'items',
      'results',
      'links',
      'oauth_links',
      'oauthLinks',
      'oauth',
      'sessions',
      'session_records',
      'sessionRecords',
      'accounts',
      'records',
      'otps',
      'otp_records',
    ];
    for (const key of keysToCheck) {
      if (Array.isArray(data[key])) {
        return data[key];
      }
    }
    // Check nested objects e.g. data.data
    if (data.data && typeof data.data === 'object') {
      const nested = normalizeArrayResponse<T>(data.data);
      if (nested.length > 0) return nested;
    }
    // Check if any top-level property value is an array
    for (const value of Object.values(data)) {
      if (Array.isArray(value)) {
        return value as T[];
      }
    }
  }
  return [];
}

/**
 * Tries multiple endpoint paths sequentially until one succeeds, handling 404/405 route variations across different backend implementations.
 */
export async function requestWithFallback<T>(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  endpoints: string[],
  payloadOrConfig?: any,
  config?: any
): Promise<T> {
  let lastError: any;
  for (const ep of endpoints) {
    try {
      if (method === 'get') {
        const res = await apiClient.get<T>(ep, payloadOrConfig);
        return res.data;
      } else if (method === 'post') {
        const res = await apiClient.post<T>(ep, payloadOrConfig, config);
        return res.data;
      } else if (method === 'put') {
        const res = await apiClient.put<T>(ep, payloadOrConfig, config);
        return res.data;
      } else if (method === 'patch') {
        const res = await apiClient.patch<T>(ep, payloadOrConfig, config);
        return res.data;
      } else if (method === 'delete') {
        const axiosConfig = payloadOrConfig
          ? payloadOrConfig.data !== undefined
            ? payloadOrConfig
            : { data: payloadOrConfig }
          : undefined;
        const res = await apiClient.delete<T>(ep, axiosConfig);
        return res.data;
      }
    } catch (err: any) {
      lastError = err;
      // If 404, 405, or 403 (due to trailing slash or route format mismatch), try next endpoint fallback
      if (err.response?.status === 404 || err.response?.status === 405 || err.response?.status === 403) {
        continue;
      }
      // For other status codes (e.g., 400, 401, 422, 500), throw directly
      throw err;
    }
  }
  throw lastError;
}

/**
 * Extracts a clear, user-friendly error message from Axios errors or generic thrown objects.
 */
export function getErrorMessage(err: any, fallbackMessage: string = 'An error occurred'): string {
  if (!err) return fallbackMessage;
  if (typeof err === 'string') return err;

  const responseData = err.response?.data;
  if (responseData) {
    if (typeof responseData === 'string') return responseData;
    if (responseData.detail && typeof responseData.detail === 'string') return responseData.detail;
    if (responseData.message && typeof responseData.message === 'string') return responseData.message;
    if (responseData.error && typeof responseData.error === 'string') return responseData.error;
    if (Array.isArray(responseData.detail)) {
      return responseData.detail.map((e: any) => e.msg || e.message || JSON.stringify(e)).join(', ');
    }
  }

  if (err.response?.status === 403) {
    return '403 Forbidden: You do not have permission to access this endpoint (Superadmin privileges or valid auth session required).';
  }
  if (err.response?.status === 401) {
    return '401 Unauthorized: Please sign in with an authorized account.';
  }
  if (err.response?.status === 404) {
    return '404 Not Found: The requested API endpoint or resource was not found.';
  }

  return err.message || fallbackMessage;
}

