import type { ChatPayload } from '@/types/session';

export const AI_MODERATOR_USER_ID = 'ai-moderator';

export function isAiMessage(msg: ChatPayload): boolean {
  if (msg.kind === 'system') return false;
  if (msg.userId === AI_MODERATOR_USER_ID) return true;
  const s = (msg.senderEmail || '').toLowerCase();
  return s.includes('ai') && s.includes('moderator');
}
