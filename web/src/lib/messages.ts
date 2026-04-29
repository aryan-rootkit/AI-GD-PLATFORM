import type { ChatPayload } from '@/types/session';

export const AI_MODERATOR_USER_ID = 'ai-moderator';

export function isAiMessage(msg: ChatPayload): boolean {
  if (msg.kind === 'system' || msg.type === 'system') return false;
  if (msg.type === 'ai') return true;
  const sid = msg.senderId || msg.userId;
  if (sid === AI_MODERATOR_USER_ID) return true;
  const s = (msg.senderName || msg.senderEmail || '').toLowerCase();
  return s.includes('ai') && s.includes('moderator');
}
