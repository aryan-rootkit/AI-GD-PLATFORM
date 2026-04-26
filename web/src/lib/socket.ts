import { io, type Socket } from 'socket.io-client';
import { SOCKET_BASE_URL } from '@/utils/constants';

/**
 * Create a Socket.IO client. Caller should connect/disconnect and swap on token change.
 * Backend expects JWT in `auth.token` (or Authorization header on handshake).
 */
export function createSocket(token: string | null): Socket {
  const url = SOCKET_BASE_URL;
  if (!url) {
    throw new Error('NEXT_PUBLIC_SOCKET_URL or NEXT_PUBLIC_API_URL is not set');
  }
  return io(url, {
    transports: ['websocket'],
    auth: token ? { token } : {},
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 8,
    reconnectionDelay: 1000,
  });
}
