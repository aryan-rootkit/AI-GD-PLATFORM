const ROOM_META_KEY = 'roomMeta';

export type StoredRoomMeta = {
  title: string;
  hostId: string;
  sessionId: string;
};

export function readRoomMeta(): StoredRoomMeta | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(ROOM_META_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<StoredRoomMeta>;
    if (!o.sessionId || typeof o.sessionId !== 'string') return null;
    return {
      sessionId: o.sessionId,
      title: typeof o.title === 'string' ? o.title : 'Session',
      hostId: typeof o.hostId === 'string' ? o.hostId : '',
    };
  } catch {
    return null;
  }
}

export function writeRoomMeta(meta: StoredRoomMeta): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(ROOM_META_KEY, JSON.stringify(meta));
}

export function clearRoomMetaStorage(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(ROOM_META_KEY);
}
