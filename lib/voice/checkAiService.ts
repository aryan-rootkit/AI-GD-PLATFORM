import { getPublicAiServiceUrl } from "@/lib/ai/config";

export async function checkAiServiceHealth(): Promise<{
  ok: boolean;
  message: string;
  ollamaReachable?: boolean;
}> {
  try {
    const res = await fetch(`${getPublicAiServiceUrl()}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return { ok: false, message: `AI service returned ${res.status}` };
    }

    const data = await res.json();
    const ollamaReachable = Boolean(data?.ollama?.reachable);

    if (!data.mock && !ollamaReachable) {
      return {
        ok: false,
        message:
          "Ollama is not running. Start it with: ollama serve && ollama pull phi3:mini",
        ollamaReachable: false,
      };
    }

    return {
      ok: true,
      message: "AI voice service ready",
      ollamaReachable,
    };
  } catch {
    return {
      ok: false,
      message:
        "Cannot reach AI service on port 8001. Run: cd ai-service && .\\scripts\\run.ps1",
    };
  }
}
