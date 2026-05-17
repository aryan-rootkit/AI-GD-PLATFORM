"use client";

import { cn } from "@/lib/utils";
import type { SessionVoiceState } from "@/lib/voice/useSessionVoice";

interface SessionControlsProps {
  sessionState: SessionVoiceState;
  serviceReady: boolean | null;
  isRecording: boolean;
  isProcessing: boolean;
  statusLabel?: string;
  onStart: () => void;
  onRecordStart: () => void;
  onRecordEnd: () => void;
  onEnd: () => void;
}

export function SessionControls({
  sessionState,
  serviceReady,
  isRecording,
  isProcessing,
  statusLabel,
  onStart,
  onRecordStart,
  onRecordEnd,
  onEnd,
}: SessionControlsProps) {
  return (
    <div className="session-controls">
      {sessionState === "idle" && (
        <button
          type="button"
          className="platform-btn-primary"
          onClick={onStart}
          disabled={serviceReady === false}
        >
          Start session
        </button>
      )}

      {sessionState === "active" && (
        <>
          <p className="session-controls-hint">
            Push-to-talk: press and hold while speaking, then release
          </p>
          <button
            type="button"
            className={cn(
              "session-mic-btn",
              isRecording && "session-mic-btn-active"
            )}
            disabled={isProcessing}
            onMouseDown={onRecordStart}
            onMouseUp={onRecordEnd}
            onMouseLeave={isRecording ? onRecordEnd : undefined}
            onTouchStart={(e) => {
              e.preventDefault();
              onRecordStart();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              onRecordEnd();
            }}
          >
            {isProcessing
              ? statusLabel || "Processing…"
              : isRecording
                ? "Recording…"
                : "Hold to speak"}
          </button>
          <button
            type="button"
            className="platform-btn-ghost"
            onClick={onEnd}
            disabled={isProcessing}
          >
            End session
          </button>
        </>
      )}

      {sessionState === "ending" && (
        <p className="text-sm text-platform-muted">Generating your report…</p>
      )}
    </div>
  );
}
