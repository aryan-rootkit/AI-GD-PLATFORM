import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { apiLogin, apiSignup } from '../api/auth';
import {
  clearToken,
  clearUser,
  getToken,
  getUser,
  saveToken,
  saveUser,
  type StoredUser,
} from '../utils/storage';

type AuthContextValue = {
  user: StoredUser | null;
  token: string | null;
  authReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [t, u] = await Promise.all([getToken(), getUser()]);
      if (!cancelled) {
        setToken(t);
        setUser(u);
        setAuthReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    await saveToken(data.token);
    const u: StoredUser = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name ?? data.user.email.split('@')[0],
    };
    await saveUser(u);
    setToken(data.token);
    setUser(u);
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    await apiSignup(name, email, password);
  }, []);

  const logout = useCallback(async () => {
    await clearToken();
    await clearUser();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      authReady,
      login,
      signup,
      logout,
    }),
    [user, token, authReady, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
