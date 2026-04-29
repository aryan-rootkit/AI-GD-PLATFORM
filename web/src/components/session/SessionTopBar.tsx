'use client';

import { Menu, MessageSquare, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type Props = {
  title: string;
  sessionId: string;
  participantCount: number;
  /** Short line under the title (e.g. discussion topic). */
  topicSubtitle?: string | null;
  isHost: boolean;
  ending: boolean;
  onOpenParticipants: () => void;
  onOpenAi: () => void;
  onMinimize: () => void;
  onLogout: () => void;
  onEndSession: () => void;
};

export function SessionTopBar({
  title,
  sessionId,
  participantCount,
  topicSubtitle,
  isHost,
  ending,
  onOpenParticipants,
  onOpenAi,
  onMinimize,
  onLogout,
  onEndSession,
}: Props) {
  const shortId = sessionId.length > 10 ? `${sessionId.slice(0, 8)}…` : sessionId;

  return (
    <header className="shrink-0 border-b border-white/5 bg-[#0c0c0e] px-2 py-2 sm:px-3 sm:py-2.5">
      <div className="flex items-start gap-2 sm:items-center">
        <Button
          type="button"
          variant="secondary"
          className="mt-0.5 shrink-0 p-2 lg:hidden"
          onClick={onOpenParticipants}
          aria-label="Open participants"
        >
          <Menu className="h-5 w-5" strokeWidth={2} aria-hidden />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="line-clamp-2 text-sm font-semibold leading-tight text-white sm:text-base">{title}</h1>
          {topicSubtitle ? (
            <p className="mt-0.5 line-clamp-2 text-xs text-violet-300/90">{topicSubtitle}</p>
          ) : null}
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 text-slate-400">
              <Users className="h-3.5 w-3.5 shrink-0 text-slate-500" strokeWidth={2} aria-hidden />
              {participantCount} {participantCount === 1 ? 'participant' : 'participants'}
            </span>
            <span className="font-mono text-slate-600" title={sessionId}>
              {shortId}
            </span>
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1 sm:gap-1.5">
          {isHost && (
            <Button
              variant="danger"
              type="button"
              onClick={onEndSession}
              disabled={ending}
              className="px-2.5 py-1.5 text-xs sm:px-3 sm:text-sm"
            >
              {ending ? 'Ending…' : 'End session'}
            </Button>
          )}
          <Button
            type="button"
            variant="secondary"
            className="p-2 sm:px-2.5"
            onClick={onOpenAi}
            title="AI insights"
            aria-label="Open AI insights"
          >
            <Sparkles className="h-4 w-4 sm:h-[1.125rem] sm:w-[1.125rem]" strokeWidth={2} aria-hidden />
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="p-2 sm:px-2.5"
            onClick={onMinimize}
            title="Minimize session (stay connected)"
            aria-label="Minimize session"
          >
            <MessageSquare className="h-4 w-4 sm:h-[1.125rem] sm:w-[1.125rem]" strokeWidth={2} aria-hidden />
          </Button>
          <Button type="button" variant="secondary" className="px-2 py-1.5 text-xs sm:px-3 sm:text-sm" onClick={onLogout}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
