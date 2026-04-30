'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ONBOARDING_KEY, TOKEN_KEY, USER_KEY } from '@/utils/constants';

export type AuthUser = { id: string; email: string; name?: string };

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  ready: boolean;
  login: (email: string, password: string, redirectTo?: string | null) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  completeOnboarding: (displayName: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem(TOKEN_KEY);
    const u = readStoredUser();
    setToken(t);
    setUser(u);
    setReady(true);
  }, []);

  const postLoginPath = useCallback(() => {
    if (typeof window === 'undefined') return '/dashboard';
    if (!localStorage.getItem(ONBOARDING_KEY)) {
      return '/onboarding';
    }
    return '/dashboard';
  }, []);

  const login = useCallback(
    async (email: string, password: string, redirectTo?: string | null) => {
      const { data } = await api.post<{ token: string; user: AuthUser }>('/api/auth/login', {
        email,
        password,
      });
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      const safe =
        redirectTo &&
        redirectTo.startsWith('/') &&
        !redirectTo.startsWith('//') &&
        !redirectTo.includes('\n')
          ? redirectTo
          : null;
      router.replace(safe || postLoginPath());
    },
    [router, postLoginPath],
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      await api.post<{ user: AuthUser }>('/api/auth/signup', { name, email, password });
      router.replace('/login');
    },
    [router],
  );

  const completeOnboarding = useCallback(
    (displayName: string) => {
      if (typeof window === 'undefined') {
        return;
      }
      const name = displayName.trim();
      setUser((prev) => {
        if (!prev) return prev;
        if (name) {
          const next: AuthUser = { ...prev, name };
          localStorage.setItem(USER_KEY, JSON.stringify(next));
          return next;
        }
        return prev;
      });
      localStorage.setItem(ONBOARDING_KEY, '1');
      router.replace('/dashboard');
    },
    [router],
  );

  const logout = useCallback(() => {
    console.log('logout triggered');
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('roomMeta');
    }
    setToken(null);
    setUser(null);
    router.replace('/');
  }, [router]);

  const value = useMemo(
    () => ({ user, token, ready, login, signup, completeOnboarding, logout }),
    [user, token, ready, login, signup, completeOnboarding, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
