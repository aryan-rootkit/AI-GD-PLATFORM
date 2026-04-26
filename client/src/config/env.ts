/**
 * Expo exposes env vars prefixed with EXPO_PUBLIC_ at build time.
 * Set EXPO_PUBLIC_API_URL in .env (see .env.example).
 */
export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || 'https://ai-gd-platform-42n4.onrender.com'
).trim().replace(/\/$/, '');
