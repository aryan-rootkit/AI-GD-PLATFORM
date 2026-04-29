'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import type { StoredRoomMeta } from '@/utils/roomMeta';
import { clearRoomMetaStorage, readRoomMeta } from '@/utils/roomMeta';

/**
 * Tracks `sessionStorage.roomMeta` for “active session” awareness (same tab + cross-tab storage events).
 */
export function useRoomMeta() {
  const pathname = usePathname();
  const [roomMeta, setRoomMeta] = useState<StoredRoomMeta | null>(() => readRoomMeta());

  const refreshRoomMeta = useCallback(() => {
    setRoomMeta(readRoomMeta());
  }, []);

  const clearRoomMeta = useCallback(() => {
    clearRoomMetaStorage();
    setRoomMeta(null);
  }, []);

  useEffect(() => {
    if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
      refreshRoomMeta();
    }
  }, [pathname, refreshRoomMeta]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'roomMeta' || e.key === null) refreshRoomMeta();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refreshRoomMeta]);

  const hasActiveRoom = Boolean(roomMeta?.sessionId);

  return { roomMeta, hasActiveRoom, refreshRoomMeta, clearRoomMeta };
}
