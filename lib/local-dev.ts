/** True when running without Firebase Admin credentials (local clone setup). */
export function isLocalDev(): boolean {
  if (process.env.USE_LOCAL_DEV === "true") return true;
  if (process.env.USE_LOCAL_DEV === "false") return false;

  return !(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  );
}

export function isLocalDevClient(): boolean {
  return process.env.NEXT_PUBLIC_USE_LOCAL_DEV === "true";
}

export function hasGoogleAiKey(): boolean {
  return Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
}
