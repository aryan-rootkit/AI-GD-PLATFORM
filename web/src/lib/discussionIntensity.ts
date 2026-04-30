import type { ChatPayload } from '@/types/session';
import { isAiMessage } from '@/lib/messages';

const WINDOW_MS = 180_000;

export type DiscussionIntensity = 'low' | 'medium' | 'high';

/** Human messages per minute in the last ~3 minutes → session “energy”. */
export function computeDiscussionIntensity(messages: ChatPayload[], now = Date.now()): DiscussionIntensity {
  const cutoff = now - WINDOW_MS;
  let humanCount = 0;
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const m = messages[i];
    if (m.type === 'system' || m.kind === 'system') continue;
    if (isAiMessage(m)) continue;
    const t = new Date(m.at || m.timestamp || 0).getTime();
    if (t < cutoff) break;
    humanCount += 1;
  }
  const minutes = WINDOW_MS / 60_000;
  const rate = humanCount / minutes;
  if (rate < 2) return 'low';
  if (rate < 6) return 'medium';
  return 'high';
}
