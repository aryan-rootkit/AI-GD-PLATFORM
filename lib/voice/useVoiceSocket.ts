"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

import { getPublicAiServiceUrl } from "@/lib/ai/config";
import { speakWithBrowser } from "@/lib/voice/speechFallback";

export type VoicePipelineStage =
  | "idle"
  | "connecting"
  | "connected"
  | "transcribing"
  | "thinking"
  | "responding"
  | "speaking"
  | "error";

export interface TranscriptMessage {
  role: "user" | "assistant";
  content: string;
}

export interface SessionEvaluation {
  totalScore: number;
  confidenceScore: number;
  clarityScore: number;
  engagementScore: number;
  categoryScores: Array<{ name: string; score: number; comment: string }>;
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
}

interface UseVoiceSocketOptions {
  sessionId: string | null;
  onTranscript?: (message: TranscriptMessage) => void;
  onStreamChunk?: (payload: { text: string; delta: string }) => void;
  onStreamStart?: () => void;
  onEvaluation?: (evaluation: SessionEvaluation) => void;
  onError?: (message: string) => void;
}

function attachSocketHandlers(
  socket: Socket,
  handlers: {
    onProcessing: (payload: { stage: string }) => void;
    onTranscriptReady: (payload: { role: string; text: string }) => void;
    onStreamStart: () => void;
    onStreamChunk: (payload: { text: string; delta: string }) => void;
    onAiText: (payload: { text: string }) => void;
    onAiAudio: (payload: {
      audio: string;
      format: string;
      fallback?: boolean;
      text?: string;
      warning?: string;
    }) => void;
    onFeedback: (payload: { evaluation: SessionEvaluation }) => void;
    onSocketError: (payload: { message: string; detail?: string }) => void;
  }
) {
  socket.off("processing");
  socket.off("transcript_ready");
  socket.off("ai_response_start");
  socket.off("ai_response_chunk");
  socket.off("ai_response_text");
  socket.off("ai_response_audio");
  socket.off("session_feedback");
  socket.off("error");

  socket.on("processing", handlers.onProcessing);
  socket.on("transcript_ready", handlers.onTranscriptReady);
  socket.on("ai_response_start", handlers.onStreamStart);
  socket.on("ai_response_chunk", handlers.onStreamChunk);
  socket.on("ai_response_text", handlers.onAiText);
  socket.on("ai_response_audio", handlers.onAiAudio);
  socket.on("session_feedback", handlers.onFeedback);
  socket.on("error", handlers.onSocketError);
}

export function useVoiceSocket({
  sessionId,
  onTranscript,
  onStreamChunk,
  onStreamStart,
  onEvaluation,
  onError,
}: UseVoiceSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const handlersBound = useRef(false);
  const lastAiTextRef = useRef("");
  const [stage, setStage] = useState<VoicePipelineStage>("idle");
  const [connected, setConnected] = useState(false);
  const [lastAiText, setLastAiText] = useState("");
  const [streamingText, setStreamingText] = useState("");

  const onTranscriptRef = useRef(onTranscript);
  const onStreamChunkRef = useRef(onStreamChunk);
  const onStreamStartRef = useRef(onStreamStart);
  const onEvaluationRef = useRef(onEvaluation);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
    onStreamChunkRef.current = onStreamChunk;
    onStreamStartRef.current = onStreamStart;
    onEvaluationRef.current = onEvaluation;
    onErrorRef.current = onError;
  }, [onTranscript, onStreamChunk, onStreamStart, onEvaluation, onError]);

  const bindHandlers = useCallback((socket: Socket) => {
    if (handlersBound.current && socketRef.current === socket) return;

    attachSocketHandlers(socket, {
      onProcessing: (payload) => {
        if (payload.stage === "transcribing") setStage("transcribing");
        else if (payload.stage === "thinking") setStage("thinking");
        else if (payload.stage === "speaking") setStage("speaking");
        else if (payload.stage === "idle") {
          setStreamingText("");
          setStage("connected");
        }
      },
      onTranscriptReady: (payload) => {
        onTranscriptRef.current?.({
          role: payload.role as "user" | "assistant",
          content: payload.text,
        });
      },
      onStreamStart: () => {
        setStreamingText("");
        setStage("responding");
        onStreamStartRef.current?.();
      },
      onStreamChunk: (payload) => {
        setStage("responding");
        setStreamingText(payload.text);
        setLastAiText(payload.text);
        lastAiTextRef.current = payload.text;
        onStreamChunkRef.current?.(payload);
      },
      onAiText: (payload) => {
        lastAiTextRef.current = payload.text;
        setLastAiText(payload.text);
        setStreamingText("");
        onTranscriptRef.current?.({ role: "assistant", content: payload.text });
      },
      onAiAudio: async (payload) => {
        const text = payload.text || lastAiTextRef.current;

        if (!payload.audio) {
          if (text) {
            setStage("speaking");
            if (payload.fallback) {
              onErrorRef.current?.(
                payload.warning ||
                  "Piper TTS unavailable — using browser voice. Check GET /debug/piper"
              );
            }
            try {
              await speakWithBrowser(text);
            } catch {
              onErrorRef.current?.("Audio playback failed. Read the transcript above.");
            }
          }
          setStage("connected");
          return;
        }

        try {
          const binary = atob(payload.audio);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          const blob = new Blob([bytes], {
            type: payload.format === "wav" ? "audio/wav" : "audio/mpeg",
          });
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          setStage("speaking");
          audio.onended = () => {
            URL.revokeObjectURL(url);
            setStage("connected");
          };
          audio.onerror = () => {
            URL.revokeObjectURL(url);
            if (text) speakWithBrowser(text).finally(() => setStage("connected"));
          };
          await audio.play();
        } catch {
          if (text) {
            try {
              await speakWithBrowser(text);
            } catch {
              onErrorRef.current?.("Could not play AI audio.");
            }
          }
          setStage("connected");
        }
      },
      onFeedback: (payload) => {
        onEvaluationRef.current?.(payload.evaluation);
      },
      onSocketError: (payload) => {
        setStage("error");
        onErrorRef.current?.(
          payload.detail ? `${payload.message}: ${payload.detail}` : payload.message
        );
      },
    });

    handlersBound.current = true;
  }, []);

  const connect = useCallback(async () => {
    if (socketRef.current?.connected) {
      bindHandlers(socketRef.current);
      return socketRef.current;
    }

    setStage("connecting");

    const socket = io(getPublicAiServiceUrl(), {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 1000,
      timeout: 15000,
    });

    socketRef.current = socket;
    bindHandlers(socket);

    return new Promise<Socket>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(
          new Error(
            "AI service connection timed out. Start: cd ai-service && uvicorn main:socket_app --reload --port 8001"
          )
        );
      }, 15000);

      const onConnect = () => {
        clearTimeout(timeout);
        socket.off("connect_error", onConnectError);
        setConnected(true);
        setStage("connected");
        resolve(socket);
      };

      const onConnectError = (err: Error) => {
        clearTimeout(timeout);
        socket.off("connect", onConnect);
        setStage("error");
        onErrorRef.current?.(err.message);
        reject(err);
      };

      socket.once("connect", onConnect);
      socket.once("connect_error", onConnectError);
    });
  }, [bindHandlers]);

  const joinSession = useCallback(
    async (id: string) => {
      const socket = await connect();
      return new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("join_session timed out")), 8000);

        socket.once("session_joined", () => {
          clearTimeout(timeout);
          resolve();
        });
        socket.once("error", (payload: { message: string }) => {
          clearTimeout(timeout);
          reject(new Error(payload.message));
        });

        socket.emit("join_session", { sessionId: id });
      });
    },
    [connect]
  );

  useEffect(() => {
    if (!sessionId) return;

    let active = true;

    (async () => {
      try {
        await joinSession(sessionId);
      } catch (err) {
        if (active) {
          onErrorRef.current?.(
            err instanceof Error ? err.message : "Connection failed"
          );
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [sessionId, joinSession]);

  const sendAudio = useCallback(
    async (audioBase64: string, filename: string, attempt = 0): Promise<void> => {
      if (!sessionId) return;

      try {
        const socket = await connect();
        if (!socket.connected) await joinSession(sessionId);

        setStage("transcribing");
        setStreamingText("");
        socket.emit("user_audio", {
          sessionId,
          audio: audioBase64,
          filename,
        });
      } catch (err) {
        if (attempt < 1) {
          socketRef.current?.disconnect();
          socketRef.current = null;
          handlersBound.current = false;
          return sendAudio(audioBase64, filename, attempt + 1);
        }
        setStage("error");
        onErrorRef.current?.(
          err instanceof Error ? err.message : "Failed to send audio"
        );
        throw err;
      }
    },
    [sessionId, connect, joinSession]
  );

  const endSession = useCallback(async () => {
    if (!sessionId) return;
    const socket = await connect();
    socket.emit("end_session", { sessionId });
  }, [sessionId, connect]);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    handlersBound.current = false;
    setConnected(false);
    setStreamingText("");
    setStage("idle");
  }, []);

  return {
    stage,
    connected,
    lastAiText,
    streamingText,
    connect,
    sendAudio,
    endSession,
    disconnect,
  };
}
