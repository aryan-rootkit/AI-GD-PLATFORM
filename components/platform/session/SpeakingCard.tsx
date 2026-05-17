"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface SpeakingCardProps {
  label: string;
  sublabel: string;
  avatarSrc: string;
  active: boolean;
  speaking: boolean;
  muted?: boolean;
}

export function SpeakingCard({
  label,
  sublabel,
  avatarSrc,
  active,
  speaking,
  muted = false,
}: SpeakingCardProps) {
  return (
    <div
      className={cn(
        "speaking-card",
        active && "speaking-card-active",
        speaking && "speaking-card-glow"
      )}
    >
      <div className="speaking-card-avatar-wrap">
        {speaking && <span className="speaking-card-pulse" aria-hidden />}
        <Image
          src={avatarSrc}
          alt=""
          width={72}
          height={72}
          className="speaking-card-avatar"
        />
        {speaking && (
          <div className="speaking-card-waveform" aria-hidden>
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} style={{ animationDelay: `${i * 0.12}s` }} />
            ))}
          </div>
        )}
      </div>
      <p className="speaking-card-label">{label}</p>
      <p className="speaking-card-sublabel">{sublabel}</p>
      <div className="speaking-card-status">
        {muted ? (
          <span className="text-platform-muted">Muted</span>
        ) : speaking ? (
          <span className="text-platform-accent">Speaking</span>
        ) : active ? (
          <span className="text-platform-muted">Listening</span>
        ) : (
          <span className="text-platform-muted">Idle</span>
        )}
      </div>
    </div>
  );
}
