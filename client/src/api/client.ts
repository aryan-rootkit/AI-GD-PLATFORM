import axios, { type AxiosError } from 'axios';
import { API_BASE_URL } from '../config/env';
import { getToken } from '../utils/storage';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => {
    const body = res.data as unknown;
    if (
      body &&
      typeof body === 'object' &&
      'success' in body &&
      (body as { success?: boolean }).success === true &&
      Object.prototype.hasOwnProperty.call(body, 'data')
    ) {
      return { ...res, data: (body as { data: typeof res.data }).data };
    }
    return res;
  },
  (error: AxiosError<{ error?: string; message?: string; success?: boolean }>) => {
    const data = error.response?.data;
    let msg = 'Something went wrong';
    if (data && typeof data === 'object') {
      if (data.success === false && typeof data.message === 'string' && data.message) {
        msg = data.message;
      } else if (typeof data.error === 'string' && data.error) {
        msg = data.error;
      } else if (typeof data.message === 'string' && data.message) {
        msg = data.message;
      }
    } else if (error.message) {
      msg = error.message;
    }
    const err = new Error(msg) as Error & { code?: string };
    if (error.code) err.code = error.code;
    return Promise.reject(err);
  },
);
