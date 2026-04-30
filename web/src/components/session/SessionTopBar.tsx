'use client';

import { Menu, MessageSquare, Sparkles, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type Props = {
  title: string;
  sessionId: string;
  participantCount: number;
  /** Short line under the title (e.g. discussion topic). */
  topicSubtitle?: string | null;
  /** e.g. "Live • 12 min" */
  sessionStatusLine?: string | null;
  /** Subtle note (e.g. evaluation awareness). */
  sessionFooterNote?: string | null;
  isHost: boolean;
  ending: boolean;
  /** AI Moderator panel visible on large screens (for toggle aria). */
  moderatorPanelExpanded?: boolean;
  onOpenParticipants: () => void;
  /** Toggle moderator panel (desktop) or open/close overlay (mobile). */
  onToggleModerator: () => void;
  onMinimize: () => void;
  onLogout: () => void;
  /** Host requests to end session (e.g. open confirm dialog). */
  onRequestEndSession: () => void;
  /** Discussion pace from recent human message rate. */
  discussionIntensity?: 'low' | 'medium' | 'high' | null;
};

export function SessionTopBar({
  title,
  sessionId,
  participantCount,
  topicSubtitle,
  sessionStatusLine,
  sessionFooterNote,
  isHost,
  ending,
  moderatorPanelExpanded = true,
  onOpenParticipants,
  onToggleModerator,
  onMinimize,
  onLogout,
  onRequestEndSession,
  discussionIntensity = null,
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
            {sessionStatusLine ? (
              <span
                className={
                  sessionStatusLine.startsWith('Live')
                    ? 'inline-flex items-center gap-1.5 font-medium text-emerald-400/95'
                    : 'inline-flex items-center gap-1.5 font-medium text-slate-500'
                }
              >
                <span
                  className={
                    sessionStatusLine.startsWith('Live')
                      ? 'h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.75)]'
                      : 'h-1.5 w-1.5 shrink-0 rounded-full bg-slate-500'
                  }
                  aria-hidden
                />
                {sessionStatusLine}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1 text-slate-400">
              <Users className="h-3.5 w-3.5 shrink-0 text-slate-500" strokeWidth={2} aria-hidden />
              {participantCount} {participantCount === 1 ? 'participant' : 'participants'}
            </span>
            <span className="font-mono text-slate-600" title={sessionId}>
              {shortId}
            </span>
            {discussionIntensity ? (
              <span
                className={[
                  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                  discussionIntensity === 'high'
                    ? 'border-amber-500/35 bg-amber-950/30 text-amber-200/90'
                    : discussionIntensity === 'medium'
                      ? 'border-violet-500/30 bg-violet-950/25 text-violet-200/85'
                      : 'border-slate-600/50 bg-slate-800/40 text-slate-500',
                ].join(' ')}
                title="Based on recent discussion pace in this room"
              >
                <Zap className="h-3 w-3 opacity-80" strokeWidth={2} aria-hidden />
                {discussionIntensity === 'low' ? 'Low' : discussionIntensity === 'medium' ? 'Medium' : 'High'}
              </span>
            ) : null}
          </p>
          {sessionFooterNote ? (
            <p className="mt-1.5 max-w-xl text-[10px] leading-snug text-slate-600 sm:text-[11px]">
              {sessionFooterNote}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1 sm:gap-1.5">
          {isHost && (
            <Button
              variant="danger"
              type="button"
              onClick={onRequestEndSession}
              disabled={ending}
              className="px-2.5 py-1.5 text-xs sm:px-3 sm:text-sm"
            >
              End session
            </Button>
          )}
          <Button
            type="button"
            variant="secondary"
            className="p-2 sm:px-2.5"
            onClick={onToggleModerator}
            title={moderatorPanelExpanded ? 'Hide AI Moderator' : 'Show AI Moderator'}
            aria-label={moderatorPanelExpanded ? 'Hide AI Moderator panel' : 'Show AI Moderator panel'}
            aria-pressed={moderatorPanelExpanded}
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
