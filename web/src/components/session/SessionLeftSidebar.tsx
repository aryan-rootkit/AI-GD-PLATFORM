'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type Participant = { id: string; label: string; isSelf: boolean; online: boolean };

type Props = {
  currentSessionId: string;
  participants: Participant[];
  participantCount: number;
  onCreateSession: () => void;
  createBusy: boolean;
  /** When set, Create is disabled and this text is used for the native tooltip. */
  createSessionDisabledReason?: string;
};

export function SessionLeftSidebar({
  currentSessionId,
  participants,
  participantCount,
  onCreateSession,
  createBusy,
  createSessionDisabledReason,
}: Props) {
  const createBlocked = Boolean(createSessionDisabledReason);
  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0c0c0e]">
      <div className="shrink-0 border-b border-white/5 p-3">
        <Link
          href="/"
          className="text-sm font-bold tracking-tight text-white/95 hover:text-violet-200"
        >
          AI GD Platform
        </Link>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-2 pt-3">
        <div className="flex items-center justify-between gap-2 px-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Participants</p>
          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-400">
            {participantCount}
          </span>
        </div>
        <ul className="mt-2 min-h-0 flex-1 space-y-1 overflow-y-auto py-1 pr-0.5">
          {participants.map((p) => (
            <li
              key={p.id}
              className={[
                'flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors',
                p.online
                  ? 'border border-emerald-500/25 bg-emerald-950/25 text-slate-100 ring-1 ring-emerald-500/20'
                  : 'border border-transparent bg-slate-900/40 text-slate-400',
              ].join(' ')}
            >
              <span className="line-clamp-1 min-w-0">
                {p.isSelf && <span className="text-emerald-200/80">You · </span>}
                {!p.isSelf && p.online && <span className="sr-only">Active: </span>}
                {p.label}
              </span>
              {p.online ? (
                <span
                  className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-300/90"
                  title="Active in session"
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]"
                    aria-hidden
                  />
                  Live
                </span>
              ) : (
                <span className="text-[10px] uppercase text-slate-600">—</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="shrink-0 space-y-2 border-t border-white/5 p-2">
        <Button
          type="button"
          onClick={onCreateSession}
          disabled={createBusy || createBlocked}
          title={createBlocked ? createSessionDisabledReason : undefined}
          className="w-full gap-2 text-sm"
          variant="primary"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          {createBusy ? 'Working…' : 'New session'}
        </Button>
        <p className="px-1 text-center text-[10px] leading-snug text-slate-600">
          {createBlocked ? createSessionDisabledReason : 'Opens another room'}
        </p>
        <p className="truncate px-1 text-center font-mono text-[10px] text-slate-600" title={currentSessionId}>
          {currentSessionId.length > 14 ? `${currentSessionId.slice(0, 14)}…` : currentSessionId}
        </p>
      </div>
    </div>
  );
}
