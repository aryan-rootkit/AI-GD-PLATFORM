export const SESSION_FLASH_KEY = 'aigd_session_flash';

export type SessionFlashKind = 'created' | 'joined' | 'practice' | 'ended';

export type SessionFlashPayload = {
  kind: SessionFlashKind;
  t?: number;
};

export function setSessionFlash(payload: SessionFlashPayload): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(SESSION_FLASH_KEY, JSON.stringify({ ...payload, t: Date.now() }));
}

/** Read and remove one-shot message (e.g. after navigation). */
export function consumeSessionFlash(): SessionFlashPayload | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(SESSION_FLASH_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(SESSION_FLASH_KEY);
  try {
    const o = JSON.parse(raw) as SessionFlashPayload;
    if (o && typeof o.kind === 'string') return o;
  } catch {
    /* ignore */
  }
  return null;
}
