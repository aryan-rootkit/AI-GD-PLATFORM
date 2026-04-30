'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { Copy, Link2, Plus, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export type SidebarParticipant = {
  id: string;
  label: string;
  isSelf: boolean;
  online: boolean;
  /** Derived: spoke recently, typing, or otherwise “in the mix”. */
  activity: 'active' | 'silent';
};

type Props = {
  currentSessionId: string;
  participants: SidebarParticipant[];
  participantCount: number;
  /** e.g. "Alex is typing…" — peers only, not self */
  typingHint?: string | null;
  /**
   * When true (e.g. user is in `/session/[id]`), show session actions instead of "New session".
   */
  isInActiveSession: boolean;
  onCreateSession?: () => void;
  createBusy?: boolean;
};

function buildInviteUrl(sessionId: string) {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/join/${encodeURIComponent(sessionId)}`;
}

export function SessionLeftSidebar({
  currentSessionId,
  participants,
  participantCount,
  isInActiveSession,
  onCreateSession,
  createBusy = false,
  typingHint = null,
}: Props) {
  const [addParticipantsOpen, setAddParticipantsOpen] = useState(false);
  const [actionHint, setActionHint] = useState<string | null>(null);

  const flashHint = useCallback((msg: string) => {
    setActionHint(msg);
    window.setTimeout(() => setActionHint(null), 2200);
  }, []);

  const copySessionId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentSessionId);
      flashHint('Session ID copied');
    } catch {
      flashHint('Could not copy');
    }
  }, [currentSessionId, flashHint]);

  const copyInviteLink = useCallback(async () => {
    const url = buildInviteUrl(currentSessionId);
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      flashHint('Invite link copied');
    } catch {
      flashHint('Could not copy link');
    }
  }, [currentSessionId, flashHint]);

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
                p.isSelf
                  ? 'border border-violet-500/40 bg-violet-950/25 text-slate-100 ring-2 ring-violet-500/35'
                  : p.activity === 'active'
                    ? 'border border-emerald-500/25 bg-emerald-950/20 text-slate-100 ring-1 ring-emerald-500/15'
                    : 'border border-transparent bg-slate-900/40 text-slate-400',
              ].join(' ')}
            >
              <span className="line-clamp-1 min-w-0">
                {p.isSelf && <span className="font-medium text-violet-200">You · </span>}
                {!p.isSelf && p.activity === 'active' && <span className="sr-only">Active: </span>}
                {p.label}
              </span>
              <span
                className={[
                  'inline-flex shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                  p.activity === 'active'
                    ? 'bg-emerald-500/15 text-emerald-300/95'
                    : 'bg-slate-800/80 text-slate-500',
                ].join(' ')}
              >
                {p.activity === 'active' ? 'Active' : 'Silent'}
              </span>
            </li>
          ))}
        </ul>
        {typingHint ? (
          <p
            className="mt-2 px-2 text-xs italic text-violet-300/90"
            role="status"
            aria-live="polite"
          >
            {typingHint}
          </p>
        ) : null}
      </div>

      <div className="shrink-0 space-y-2 border-t border-white/5 p-2">
        {actionHint ? (
          <p className="px-1 text-center text-[10px] font-medium text-emerald-400/90">{actionHint}</p>
        ) : null}

        {isInActiveSession ? (
          <div className="space-y-2">
            <Button
              type="button"
              variant="secondary"
              className="w-full gap-2 text-sm"
              onClick={() => setAddParticipantsOpen(true)}
            >
              <UserPlus className="h-4 w-4" strokeWidth={2} aria-hidden />
              Add participants
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full gap-2 text-sm"
              onClick={() => void copySessionId()}
            >
              <Copy className="h-4 w-4" strokeWidth={2} aria-hidden />
              Copy session ID
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full gap-2 text-sm"
              onClick={() => void copyInviteLink()}
            >
              <Link2 className="h-4 w-4" strokeWidth={2} aria-hidden />
              Invite link
            </Button>
            <p className="truncate px-1 text-center font-mono text-[10px] text-slate-600" title={currentSessionId}>
              {currentSessionId.length > 14 ? `${currentSessionId.slice(0, 14)}…` : currentSessionId}
            </p>
          </div>
        ) : (
          <>
            <Button
              type="button"
              onClick={onCreateSession}
              disabled={createBusy || !onCreateSession}
              className="w-full gap-2 text-sm"
              variant="primary"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden />
              {createBusy ? 'Working…' : 'New session'}
            </Button>
            <p className="px-1 text-center text-[10px] leading-snug text-slate-600">Opens another room</p>
            <p
              className="truncate px-1 text-center font-mono text-[10px] text-slate-600"
              title={currentSessionId}
            >
              {currentSessionId.length > 14 ? `${currentSessionId.slice(0, 14)}…` : currentSessionId}
            </p>
          </>
        )}
      </div>

      {addParticipantsOpen ? (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-participants-title"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Close dialog"
            onClick={() => setAddParticipantsOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-white/10 bg-[#141416] p-4 shadow-2xl shadow-black/50">
            <h2 id="add-participants-title" className="text-base font-semibold text-white">
              Add participants
            </h2>
            <p className="mt-2 text-sm text-slate-500">Coming soon.</p>
            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setAddParticipantsOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
