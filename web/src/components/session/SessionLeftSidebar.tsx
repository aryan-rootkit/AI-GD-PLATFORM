'use client';

import Link from 'next/link';
import { Plus, Hash, Radio } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type Props = {
  currentSessionId: string;
  title: string;
  participants: { id: string; label: string; isSelf: boolean; online: boolean }[];
  onCreateSession: () => void;
  createBusy: boolean;
};

export function SessionLeftSidebar({
  currentSessionId,
  title,
  participants,
  onCreateSession,
  createBusy,
}: Props) {
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
      <div className="shrink-0 p-2">
        <Button
          type="button"
          onClick={onCreateSession}
          disabled={createBusy}
          className="w-full gap-2 text-sm"
          variant="primary"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          {createBusy ? 'Working…' : 'Create session'}
        </Button>
        <p className="mt-1.5 px-1 text-[10px] text-slate-500">Opens dashboard flow</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2">
        <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Active
        </p>
        <div
          className="flex w-full items-center gap-2 rounded-md bg-violet-500/10 px-2.5 py-1.5 text-left text-sm text-violet-100"
          title={title}
        >
          <Hash className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
          <span className="line-clamp-1 flex-1 font-medium">{title}</span>
        </div>
        <p className="mt-3 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
          In room
        </p>
        <ul className="space-y-0.5">
          {participants.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-sm text-slate-300"
            >
              <span className="line-clamp-1 min-w-0">
                {p.isSelf && <span className="text-slate-500">(you) </span>}
                {p.label}
              </span>
              {p.online && (
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]"
                  title="In session"
                  aria-label="In session"
                />
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="shrink-0 border-t border-white/5 p-3 text-xs text-slate-500">
        <p className="line-clamp-1 font-mono" title={currentSessionId}>
          {currentSessionId}
        </p>
        <div className="mt-1 flex items-center gap-1 text-slate-600">
          <Radio className="h-3 w-3" strokeWidth={2.5} aria-hidden />
          Live
        </div>
      </div>
    </div>
  );
}
