'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Socket } from 'socket.io-client';
import { createSocket } from '@/lib/socket';
import { useAuth } from '@/context/AuthContext';
import { TOKEN_KEY } from '@/utils/constants';

const SocketContext = createContext<Socket | null>(null);

/**
 * One shared socket per browser session; reconnects when JWT changes.
 */
export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { token, ready } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!ready) return;

    const t = token ?? (typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null);

    if (!t) {
      setSocket((prev) => {
        prev?.removeAllListeners();
        prev?.disconnect();
        return null;
      });
      return;
    }

    const s = createSocket(t);
    s.connect();
    setSocket(s);

    return () => {
      s.removeAllListeners();
      s.disconnect();
    };
  }, [token, ready]);

  const value = useMemo(() => socket, [socket]);

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket(): Socket | null {
  return useContext(SocketContext);
}
