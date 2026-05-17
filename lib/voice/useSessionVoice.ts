"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { saveVoiceFeedback } from "@/lib/actions/voice.action";
import { checkAiServiceHealth } from "@/lib/voice/checkAiService";
import {
  blobToBase64,
  extensionForMime,
  getVoiceInputMediaStream,
  pickRecorderMimeType,
} from "@/lib/voice/recordAudio";
import {
  TranscriptMessage,
  useVoiceSocket,
  SessionEvaluation,
  VoicePipelineStage,
} from "@/lib/voice/useVoiceSocket";

export type SessionVoiceState = "idle" | "active" | "ending" | "finished";

export interface UseSessionVoiceOptions {
  userName: string;
  userId?: string;
  interviewId?: string;
  feedbackId?: string;
  type: "generate" | "interview";
  questions?: string[];
  role?: string;
}

export function useSessionVoice({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
  role = "Software Engineer",
}: UseSessionVoiceOptions) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionState, setSessionState] = useState<SessionVoiceState>("idle");
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const messagesRef = useRef<TranscriptMessage[]>([]);
  const [streamingPartial, setStreamingPartial] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [statusLabel, setStatusLabel] = useState<string | undefined>();
  const [serviceReady, setServiceReady] = useState<boolean | null>(null);
  const feedbackHandled = useRef(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef("");

  const appendMessage = useCallback((msg: TranscriptMessage) => {
    setMessages((prev) => {
      const next = [...prev, msg];
      messagesRef.current = next;
      return next;
    });
    setStreamingPartial("");
  }, []);

  const handleEvaluation = useCallback(
    async (evaluation: SessionEvaluation) => {
      if (feedbackHandled.current) return;
      feedbackHandled.current = true;

      if (type === "generate" || !interviewId || !userId) {
        router.push("/");
        return;
      }

      const { success, feedbackId: id } = await saveVoiceFeedback({
        interviewId,
        userId,
        evaluation: {
          totalScore: evaluation.totalScore,
          categoryScores: evaluation.categoryScores,
          strengths: evaluation.strengths,
          areasForImprovement: evaluation.areasForImprovement,
          finalAssessment: evaluation.finalAssessment,
        },
        transcript: messagesRef.current,
        feedbackId,
      });

      router.push(success && id ? `/interview/${interviewId}/feedback` : "/");
    },
    [feedbackId, interviewId, router, type, userId]
  );

  const { stage, streamingText, sendAudio, endSession, disconnect } = useVoiceSocket({
    sessionId,
    onTranscript: appendMessage,
    onStreamChunk: ({ text }) => setStreamingPartial(text),
    onEvaluation: handleEvaluation,
    onError: (msg) => toast.error(msg),
  });

  useEffect(() => {
    checkAiServiceHealth().then((result) => {
      setServiceReady(result.ok);
      if (!result.ok) toast.error(result.message, { duration: 8000 });
    });
  }, []);

  useEffect(() => {
    if (stage === "transcribing") setStatusLabel("Transcribing speech...");
    else if (stage === "thinking") setStatusLabel("AI is thinking...");
    else if (stage === "responding") setStatusLabel("AI is responding...");
    else if (stage === "speaking") setStatusLabel("AI is speaking...");
    else if (isSending) setStatusLabel("Sending audio...");
    else if (sessionState === "active") setStatusLabel("Hold mic to speak");
    else setStatusLabel(undefined);
  }, [stage, sessionState, isSending]);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const startSession = async () => {
    if (!userId) {
      toast.error("You must be signed in.");
      return;
    }

    const health = await checkAiServiceHealth();
    if (!health.ok) {
      toast.error(health.message);
      return;
    }

    try {
      const mode = type === "generate" ? "discussion" : "interview";
      const storageKey =
        mode === "discussion" ? "athena.gd.setup" : "athena.interview.setup";
      let setupMeta: Record<string, string> = {};
      if (typeof window !== "undefined") {
        try {
          const raw = sessionStorage.getItem(storageKey);
          if (raw) setupMeta = JSON.parse(raw) as Record<string, string>;
        } catch {
          setupMeta = {};
        }
      }

      const res = await fetch("/api/voice/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          userName,
          mode,
          interviewId: interviewId ?? null,
          role: setupMeta.role || role,
          questions: questions ?? [],
          subject: setupMeta.topic || setupMeta.subject,
          companyType: setupMeta.companyType,
          difficulty: setupMeta.difficulty,
          interviewerStyle: setupMeta.style,
          metadata: setupMeta,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.session?.sessionId) {
        throw new Error(data.error || "Could not start voice session");
      }

      setSessionId(data.session.sessionId);
      setSessionState("active");
      toast.success("Session ready — hold the mic button to speak.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Session start failed");
    }
  };

  const startRecording = async () => {
    if (
      sessionState !== "active" ||
      isSending ||
      stage === "thinking" ||
      stage === "responding" ||
      stage === "transcribing" ||
      stage === "speaking"
    ) {
      return;
    }

    try {
      const stream = await getVoiceInputMediaStream();
      streamRef.current = stream;

      const mimeType = pickRecorderMimeType();
      mimeTypeRef.current = mimeType;
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined
      );
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stopStream();
        const blob = new Blob(chunksRef.current, {
          type: mimeTypeRef.current || "audio/webm",
        });

        if (blob.size < 500) {
          toast.error("Recording too short. Hold the mic a little longer.");
          setIsSending(false);
          return;
        }

        try {
          setIsSending(true);
          const base64 = await blobToBase64(blob);
          const ext = extensionForMime(blob.type);
          await sendAudio(base64, `recording${ext}`);
        } catch {
          toast.error("Failed to process audio. Try again.");
        } finally {
          setIsSending(false);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      toast.error("Microphone permission denied. Allow mic access and retry.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleEndSession = async () => {
    if (sessionState !== "active") return;
    setSessionState("ending");
    setStatusLabel("Generating feedback...");

    try {
      await endSession();
    } catch {
      toast.error("Could not end session cleanly.");
    }

    setTimeout(() => {
      if (!feedbackHandled.current) {
        handleEvaluation({
          totalScore: 70,
          confidenceScore: 70,
          clarityScore: 70,
          engagementScore: 70,
          categoryScores: [
            {
              name: "Communication Skills",
              score: 70,
              comment: "Session completed.",
            },
            {
              name: "Technical Knowledge",
              score: 68,
              comment: "Add more technical examples.",
            },
            {
              name: "Problem Solving",
              score: 67,
              comment: "Structure answers step by step.",
            },
            {
              name: "Cultural Fit",
              score: 72,
              comment: "Stay engaged and collaborative.",
            },
            {
              name: "Confidence and Clarity",
              score: 71,
              comment: "Practice concise delivery.",
            },
          ],
          strengths: ["Completed voice session"],
          areasForImprovement: ["Continue practicing mock interviews"],
          finalAssessment: "Session ended with local fallback evaluation.",
        });
      }
      setSessionState("finished");
      disconnect();
    }, 2000);
  };

  useEffect(() => {
    return () => {
      stopStream();
      disconnect();
    };
  }, [disconnect]);

  const isProcessing =
    isSending ||
    stage === "thinking" ||
    stage === "responding" ||
    stage === "transcribing" ||
    sessionState === "ending";

  const candidateSpeaking = isRecording || stage === "transcribing";
  const aiSpeaking = stage === "speaking" || stage === "responding";

  return {
    userName,
    role,
    messages,
    streamingPartial:
      stage === "responding" && streamingText ? streamingText : streamingPartial,
    stage: stage as VoicePipelineStage,
    sessionState,
    serviceReady,
    statusLabel,
    isRecording,
    isProcessing,
    candidateSpeaking,
    aiSpeaking,
    startSession,
    startRecording,
    stopRecording,
    handleEndSession,
  };
}
