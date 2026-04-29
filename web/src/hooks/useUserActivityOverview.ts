'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import type { UserActivityOverview } from '@/types/userActivity';
import { API_BASE_URL } from '@/utils/constants';

const FALLBACK_OVERVIEW: UserActivityOverview = {
  sessionsParticipated: 0,
  lastSessionScore: null,
  activeSession: false,
};

export function useUserActivityOverview(activeSessionFromClient: boolean) {
  const [base, setBase] = useState<UserActivityOverview>(FALLBACK_OVERVIEW);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!API_BASE_URL) {
      setBase(FALLBACK_OVERVIEW);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const { data } = await api.get<UserActivityOverview>('/api/user/activity');
        if (cancelled) return;
        const next: UserActivityOverview = {
          sessionsParticipated: Number(data?.sessionsParticipated) || 0,
          lastSessionScore:
            data?.lastSessionScore === null || data?.lastSessionScore === undefined
              ? null
              : Number(data.lastSessionScore),
          activeSession: Boolean(data?.activeSession),
        };
        setBase(next);
      } catch {
        if (cancelled) return;
        setBase(FALLBACK_OVERVIEW);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const overview = useMemo(
    (): UserActivityOverview => ({
      ...base,
      activeSession: base.activeSession || activeSessionFromClient,
    }),
    [base, activeSessionFromClient],
  );

  return { overview, loading };
}
