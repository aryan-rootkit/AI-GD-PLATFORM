/** True when running without Firebase Admin credentials (local clone setup). */
export function isLocalDev(): boolean {
  if (process.env.SKIP_AUTH === "true") return true;
  if (process.env.USE_LOCAL_DEV === "true") return true;
  if (process.env.USE_LOCAL_DEV === "false") return false;

  return !(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  );
}

/** Skip login UI and use a demo session (local file DB). */
export function shouldSkipAuth(): boolean {
  if (process.env.SKIP_AUTH === "true") return true;
  return isLocalDev();
}

function hasValidFirebaseClientConfig(): boolean {
  const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  return Boolean(key && key.length > 20 && key !== "undefined");
}

export function isLocalDevClient(): boolean {
  if (process.env.NEXT_PUBLIC_SKIP_AUTH === "true") return true;
  if (process.env.NEXT_PUBLIC_USE_LOCAL_DEV === "true") return true;
  if (process.env.NEXT_PUBLIC_USE_LOCAL_DEV === "false") return false;
  // Avoid Firebase client when API key is missing/invalid (prevents auth/invalid-api-key)
  return !hasValidFirebaseClientConfig();
}

export function shouldSkipAuthClient(): boolean {
  if (process.env.NEXT_PUBLIC_SKIP_AUTH === "true") return true;
  return isLocalDevClient();
}

export function hasGoogleAiKey(): boolean {
  return Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
}
