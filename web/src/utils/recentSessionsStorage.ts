import { RECENT_SESSIONS_KEY } from '@/utils/constants';
import type { RecentSessionEntry } from '@/types/recentSession';

const MAX_ENTRIES = 20;

function parseList(raw: string | null): RecentSessionEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((row): RecentSessionEntry | null => {
        if (!row || typeof row !== 'object') return null;
        const o = row as Record<string, unknown>;
        const sessionId = typeof o.sessionId === 'string' ? o.sessionId : '';
        const sessionName = typeof o.sessionName === 'string' ? o.sessionName : '';
        const lastJoinedAt = typeof o.lastJoinedAt === 'number' ? o.lastJoinedAt : 0;
        if (!sessionId) return null;
        return {
          sessionId,
          sessionName: sessionName || 'Untitled session',
          lastJoinedAt: lastJoinedAt || Date.now(),
        };
      })
      .filter((x): x is RecentSessionEntry => x !== null);
  } catch {
    return [];
  }
}

export function readRecentSessions(): RecentSessionEntry[] {
  if (typeof window === 'undefined') return [];
  return parseList(localStorage.getItem(RECENT_SESSIONS_KEY));
}

export function writeRecentSessions(entries: RecentSessionEntry[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(RECENT_SESSIONS_KEY, JSON.stringify(entries));
}

/** Prepend or refresh entry; cap list length. Returns the new list. */
export function addRecentSession(entry: {
  sessionName: string;
  sessionId: string;
  lastJoinedAt?: number;
}): RecentSessionEntry[] {
  const ts = entry.lastJoinedAt ?? Date.now();
  const normalized: RecentSessionEntry = {
    sessionId: entry.sessionId,
    sessionName: entry.sessionName.trim() || 'Untitled session',
    lastJoinedAt: ts,
  };
  const existing = readRecentSessions();
  const next = [
    normalized,
    ...existing.filter((e) => e.sessionId !== normalized.sessionId),
  ].slice(0, MAX_ENTRIES);
  writeRecentSessions(next);
  return next;
}
