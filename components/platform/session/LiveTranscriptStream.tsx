"use client";

import { TranscriptMessage } from "@/lib/voice/useVoiceSocket";
import { VoicePipelineStage } from "@/lib/voice/useVoiceSocket";
import { cn } from "@/lib/utils";

interface LiveTranscriptStreamProps {
  messages: TranscriptMessage[];
  partialText?: string;
  stage: VoicePipelineStage;
  userName: string;
}

export function LiveTranscriptStream({
  messages,
  partialText,
  stage,
  userName,
}: LiveTranscriptStreamProps) {
  const isThinking = stage === "thinking";
  const isStreaming = stage === "responding" && !!partialText;

  return (
    <div className="transcript-stream" aria-live="polite">
      <div className="transcript-stream-inner">
        {messages.length === 0 && !partialText && !isThinking && (
          <p className="transcript-stream-placeholder">
            Your conversation will appear here as you speak.
          </p>
        )}

        {messages.map((msg, i) => (
          <TranscriptLine
            key={`${msg.role}-${i}`}
            speaker={msg.role === "user" ? userName : "ATHENA"}
            text={msg.content}
          />
        ))}

        {isStreaming && (
          <TranscriptLine
            speaker="ATHENA"
            text={partialText}
            partial
            className="transcript-line-streaming"
          />
        )}

        {isThinking && (
          <div className="transcript-thinking">
            <span className="transcript-thinking-dot" />
            <span className="transcript-thinking-dot" />
            <span className="transcript-thinking-dot" />
            <span className="text-sm text-platform-muted ml-2">AI thinking</span>
          </div>
        )}

        {stage === "transcribing" && (
          <p className="text-xs text-platform-muted text-center animate-pulse">
            Processing your speech…
          </p>
        )}
      </div>
    </div>
  );
}

function TranscriptLine({
  speaker,
  text,
  partial,
  className,
}: {
  speaker: string;
  text: string;
  partial?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("transcript-line animate-fadeIn", className)}>
      <span className="transcript-line-speaker">{speaker}</span>
      <p className="transcript-line-text">
        {text}
        {partial && <span className="transcript-cursor" />}
      </p>
    </div>
  );
}
