import { NextResponse } from "next/server";

import { getAiServiceUrl } from "@/lib/ai/config";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const aiUrl = getAiServiceUrl();

    const response = await fetch(`${aiUrl}/conversation/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.detail || "Failed to create session" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Voice session proxy error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          "ATHENA voice service unavailable. Start it with: cd ai-service && uvicorn main:socket_app --reload --port 8001",
      },
      { status: 503 }
    );
  }
}
