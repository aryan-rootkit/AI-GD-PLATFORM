import type { ChatPayload } from '@/types/session';
import { isAiMessage } from '@/lib/messages';

const RECENT_MESSAGE_MS = 120_000;

export type LastHumanMessageMeta = { userId: string; at: number };

/** Last non-system, non-AI message in the thread (for “recent speaker” activity). */
export function getLastHumanMessageMeta(messages: ChatPayload[]): LastHumanMessageMeta | null {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const m = messages[i];
    if (m.type === 'system' || m.kind === 'system') continue;
    if (isAiMessage(m)) continue;
    const userId = m.senderId || m.userId;
    if (!userId) continue;
    const raw = m.at || m.timestamp;
    const at = raw ? new Date(raw).getTime() : Date.now();
    return { userId, at };
  }
  return null;
}

export function isRecentSpeaker(meta: LastHumanMessageMeta | null, userId: string, now: number): boolean {
  if (!meta || meta.userId !== userId) return false;
  return now - meta.at < RECENT_MESSAGE_MS;
}

/** One or two names, or “Several people…” */
export function formatPeerTypingLine(peers: Record<string, string>): string | null {
  const names = [...new Set(Object.values(peers))];
  if (names.length === 0) return null;
  if (names.length === 1) return `${names[0]} is typing…`;
  if (names.length === 2) return `${names[0]} and ${names[1]} are typing…`;
  return 'Several people are typing…';
}
