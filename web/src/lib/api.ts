import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, TOKEN_KEY } from '@/utils/constants';

export const api = axios.create({
  baseURL: API_BASE_URL || undefined,
  timeout: 40000,
  headers: { 'Content-Type': 'application/json' },
});

function buildFullUrl(config: InternalAxiosRequestConfig): string {
  const path = config.url || '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = (config.baseURL as string | undefined) || API_BASE_URL;
  if (!base) return path;
  const cleanBase = base.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

const debugApi =
  process.env.NEXT_PUBLIC_DEBUG_API === '1' ||
  process.env.NODE_ENV === 'development';

api.interceptors.request.use((config) => {
  const fullUrl = buildFullUrl(config);
  const method = (config.method || 'get').toUpperCase();

  if (debugApi) {
    // Temporary-style trace: set NEXT_PUBLIC_DEBUG_API=0 in production to silence.
    console.log('API CALL:', method, fullUrl);
  }

  if (typeof window !== 'undefined') {
    if (!API_BASE_URL) {
      const msg =
        'API base URL is not set. Add NEXT_PUBLIC_API_URL in .env.local (local) or Vercel Environment Variables (production) to your backend origin (no /api suffix unless your server uses it).';
      console.error('API ERROR:', msg);
      return Promise.reject(new Error(msg));
    }

    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ error?: string; message?: string }>) => {
    const data = error.response?.data;
    let msg = 'Something went wrong';
    if (data && typeof data === 'object') {
      if (typeof data.error === 'string' && data.error) msg = data.error;
      else if (typeof data.message === 'string' && data.message) msg = data.message;
    } else if (error.message) {
      msg = error.message;
    }

    if (debugApi) {
      console.error('API ERROR:', error.response?.status, data ?? error.message);
    }

    const err = new Error(msg) as Error & { code?: string };
    if (error.code) err.code = error.code;
    return Promise.reject(err);
  },
);
