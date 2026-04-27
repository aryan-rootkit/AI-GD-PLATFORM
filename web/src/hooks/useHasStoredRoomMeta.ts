'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

function readHasRoomMeta(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = sessionStorage.getItem('roomMeta');
    if (!raw) return false;
    const o = JSON.parse(raw) as { sessionId?: string };
    return Boolean(o.sessionId && typeof o.sessionId === 'string');
  } catch {
    return false;
  }
}

/**
 * True when `sessionStorage.roomMeta` has a session id (user is tied to an active room context).
 * Re-evaluates when navigating to `/dashboard` so leaving a session updates UI.
 */
export function useHasStoredRoomMeta() {
  const pathname = usePathname();
  const [has, setHas] = useState(() => readHasRoomMeta());

  const refresh = useCallback(() => {
    setHas(readHasRoomMeta());
  }, []);

  useEffect(() => {
    if (pathname === '/dashboard') {
      refresh();
    }
  }, [pathname, refresh]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'roomMeta' || e.key === null) refresh();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refresh]);

  return { hasStoredRoomMeta: has, refreshRoomMeta: refresh };
}
