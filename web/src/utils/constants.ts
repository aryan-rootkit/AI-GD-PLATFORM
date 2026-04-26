/** Trim and strip trailing slashes so paths like `/auth/login` never become `//auth/login`. */
export function normalizePublicOrigin(raw: string | undefined): string {
  if (raw == null || raw === '') return '';
  return raw.trim().replace(/\/+$/, '');
}

/** Public env (inlined at build time). Backend mounts `/auth` and `/session` at server root — no `/api` prefix. */
export const API_BASE_URL = normalizePublicOrigin(process.env.NEXT_PUBLIC_API_URL);

export const SOCKET_BASE_URL =
  normalizePublicOrigin(process.env.NEXT_PUBLIC_SOCKET_URL) || API_BASE_URL;

export const TOKEN_KEY = 'aigd_token';
export const USER_KEY = 'aigd_user';
