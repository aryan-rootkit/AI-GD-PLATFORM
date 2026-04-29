/** Trim and strip trailing slashes so paths like `/api/auth/login` never become `//api/auth/login`. */
export function normalizePublicOrigin(raw: string | undefined): string {
  if (raw == null || raw === '') return '';
  return raw.trim().replace(/\/+$/, '');
}

/** Public env (inlined at build time). Auth is under `/api/auth` on the server; use `NEXT_PUBLIC_API_URL` without a trailing `/api` so paths are not doubled. */
export const API_BASE_URL = normalizePublicOrigin(process.env.NEXT_PUBLIC_API_URL);

export const SOCKET_BASE_URL =
  normalizePublicOrigin(process.env.NEXT_PUBLIC_SOCKET_URL) || API_BASE_URL;

export const TOKEN_KEY = 'aigd_token';
export const USER_KEY = 'aigd_user';
/** Set on first "Continue" in `/onboarding` (local; controls post-login route). */
export const ONBOARDING_KEY = 'aigd_onboarded';
/** Dashboard join UX: recently opened sessions (local only). */
export const RECENT_SESSIONS_KEY = 'aigd_recent_sessions';
