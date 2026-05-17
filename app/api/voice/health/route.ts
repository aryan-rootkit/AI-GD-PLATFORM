import { NextResponse } from "next/server";

import { getAiServiceUrl } from "@/lib/ai/config";

export async function GET() {
  try {
    const res = await fetch(`${getAiServiceUrl()}/health`, {
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "AI service unreachable",
        detail: error instanceof Error ? error.message : "unknown",
      },
      { status: 503 }
    );
  }
}
