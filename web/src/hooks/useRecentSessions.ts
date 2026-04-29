'use client';

import { useCallback, useEffect, useState } from 'react';
import type { RecentSessionEntry } from '@/types/recentSession';
import { addRecentSession, readRecentSessions } from '@/utils/recentSessionsStorage';

export function useRecentSessions() {
  const [recentSessions, setRecentSessions] = useState<RecentSessionEntry[]>([]);

  useEffect(() => {
    setRecentSessions(readRecentSessions());
  }, []);

  const rememberSession = useCallback((s: { title: string; id: string }) => {
    const next = addRecentSession({
      sessionName: s.title?.trim() ? s.title : 'Untitled session',
      sessionId: s.id,
    });
    setRecentSessions(next);
  }, []);

  return { recentSessions, rememberSession };
}
