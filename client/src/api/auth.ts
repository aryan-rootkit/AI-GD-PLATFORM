import { api } from './client';

export type AuthUser = { id: string; email: string; name?: string };

export async function apiLogin(email: string, password: string) {
  const { data } = await api.post<{ token: string; user: AuthUser }>('/api/auth/login', {
    email,
    password,
  });
  return data;
}

export async function apiSignup(name: string, email: string, password: string) {
  const { data } = await api.post<{ user: AuthUser }>('/api/auth/signup', {
    name,
    email,
    password,
  });
  return data;
}
