"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export function AgentCards({
  userName,
  isSpeaking,
  statusLabel,
}: {
  userName: string;
  isSpeaking: boolean;
  statusLabel?: string;
}) {
  return (
    <div className="call-view">
      <div className="card-interviewer">
        <div className="avatar">
          <Image
            src="/athena-logo.png"
            alt="ATHENA AI interviewer"
            width={65}
            height={54}
            className="object-contain"
          />
          {isSpeaking && <span className="animate-speak" />}
        </div>
        <h3>ATHENA</h3>
        {statusLabel ? (
          <p className="text-sm text-primary-200 mt-2">{statusLabel}</p>
        ) : null}
      </div>

      <div className="card-border">
        <div className="card-content">
          <Image
            src="/user-avatar.png"
            alt="User"
            width={120}
            height={120}
            className="rounded-full object-cover size-[120px]"
          />
          <h3>{userName}</h3>
        </div>
      </div>
    </div>
  );
}

export function AgentTranscript({ text }: { text: string }) {
  if (!text) return null;

  return (
    <div className="transcript-border">
      <div className="transcript">
        <p
          key={text}
          className={cn(
            "transition-opacity duration-500 opacity-0",
            "animate-fadeIn opacity-100"
          )}
        >
          {text}
        </p>
      </div>
    </div>
  );
}
