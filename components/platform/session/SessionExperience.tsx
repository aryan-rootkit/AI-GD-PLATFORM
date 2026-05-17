"use client";

import { useSessionVoice } from "@/lib/voice/useSessionVoice";
import { SessionInfoBar } from "@/components/platform/session/SessionInfoBar";
import { SpeakingCard } from "@/components/platform/session/SpeakingCard";
import { LiveTranscriptStream } from "@/components/platform/session/LiveTranscriptStream";
import { SessionControls } from "@/components/platform/session/SessionControls";

interface SessionExperienceProps extends AgentProps {
  sessionTitle?: string;
  sessionSubtitle?: string;
  mode?: "interview" | "gd";
}

export function SessionExperience({
  sessionTitle,
  sessionSubtitle,
  mode = "interview",
  ...agentProps
}: SessionExperienceProps) {
  const voice = useSessionVoice(agentProps);

  const title =
    sessionTitle ||
    `${agentProps.role || "Software Engineer"} ${mode === "gd" ? "Discussion" : "Interview"}`;

  return (
    <div className="session-experience">
      {voice.serviceReady === false && (
        <p className="session-service-warning">
          AI voice service offline — start Ollama and run{" "}
          <code>npm run dev:ai</code>
        </p>
      )}

      <SessionInfoBar
        title={title}
        subtitle={sessionSubtitle}
        statusLabel={voice.statusLabel}
        mode={mode}
      />

      <div className="session-arena">
        <SpeakingCard
          label={voice.userName}
          sublabel="Candidate"
          avatarSrc="/profile.svg"
          active={voice.sessionState === "active"}
          speaking={voice.candidateSpeaking}
        />
        <SpeakingCard
          label="ATHENA"
          sublabel={mode === "gd" ? "Discussion Moderator" : "AI Interviewer"}
          avatarSrc="/athena-logo.png"
          active={voice.sessionState === "active"}
          speaking={voice.aiSpeaking}
        />
      </div>

      <LiveTranscriptStream
        messages={voice.messages}
        partialText={voice.streamingPartial}
        stage={voice.stage}
        userName={voice.userName}
      />

      <SessionControls
        sessionState={voice.sessionState}
        serviceReady={voice.serviceReady}
        isRecording={voice.isRecording}
        isProcessing={voice.isProcessing}
        statusLabel={voice.statusLabel}
        onStart={voice.startSession}
        onRecordStart={voice.startRecording}
        onRecordEnd={voice.stopRecording}
        onEnd={voice.handleEndSession}
      />
    </div>
  );
}
