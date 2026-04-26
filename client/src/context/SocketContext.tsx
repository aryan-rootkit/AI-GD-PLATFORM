import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { API_BASE_URL } from '../config/env';
import { useAuth } from './AuthContext';

const SocketContext = createContext<Socket | null>(null);

/**
 * Single Socket.IO client, authenticated with JWT from AuthContext.
 * Recreates socket when token changes (login/logout).
 */
export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { token, authReady } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!authReady || !token) {
      setSocket((prev) => {
        prev?.removeAllListeners();
        prev?.disconnect();
        return null;
      });
      return;
    }

    const s = io(API_BASE_URL, {
      transports: ['websocket'],
      auth: { token },
    });

    setSocket(s);

    return () => {
      s.removeAllListeners();
      s.disconnect();
    };
  }, [token, authReady]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

export function useSocket(): Socket | null {
  return useContext(SocketContext);
}
