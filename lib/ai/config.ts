/** Server-side AI service configuration */
export function getAiServiceUrl(): string {
  return (
    process.env.AI_SERVICE_URL ||
    process.env.NEXT_PUBLIC_AI_SERVICE_URL ||
    "http://localhost:8001"
  );
}

/** Client-side: use local open-source voice pipeline instead of Vapi */
export function useVoicePipelineClient(): boolean {
  if (process.env.NEXT_PUBLIC_USE_VOICE_PIPELINE === "false") return false;
  if (process.env.NEXT_PUBLIC_USE_VOICE_PIPELINE === "true") return true;
  return Boolean(process.env.NEXT_PUBLIC_AI_SERVICE_URL);
}

export function getPublicAiServiceUrl(): string {
  return process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:8001";
}
