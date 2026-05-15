'use client';

import type { RecentSessionEntry } from '@/types/recentSession';
import { Button } from '@/components/ui/Button';
import { Loader2 } from 'lucide-react';

type Props = {
  items: RecentSessionEntry[];
  onRowClickFill: (sessionId: string) => void;
  onJoin: (sessionId: string) => void;
  joinBusyForId: string | null;
  disabled: boolean;
};

export function RecentSessionsList({
  items,
  onRowClickFill,
  onJoin,
  joinBusyForId,
  disabled,
}: Props) {
  if (items.length === 0) {
    return (
      <div
        className="rounded-xl border border-dashed border-white/10 bg-slate-900/30 px-4 py-6 text-center backdrop-blur-sm"
        role="status"
      >
        <p className="text-sm font-medium text-slate-400">No recent sessions yet</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Join or create a session to see it listed here.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar" aria-label="Recent sessions">
      {items.map((item) => {
        const rowBusy = joinBusyForId === item.sessionId;
        return (
          <li
            key={item.sessionId}
            className="flex min-w-0 items-stretch gap-2 rounded-xl border border-white/5 bg-slate-800/30 backdrop-blur-sm transition-colors hover:bg-slate-800/50 hover:border-white/10"
          >
            <button
              type="button"
              onClick={() => onRowClickFill(item.sessionId)}
              disabled={disabled}
              className="min-w-0 flex-1 px-4 py-3 text-left transition-opacity disabled:pointer-events-none disabled:opacity-50"
            >
              <span className="block truncate text-sm font-medium text-slate-100">{item.sessionName}</span>
              <span className="mt-0.5 block truncate font-mono text-xs text-violet-400/70">{item.sessionId}</span>
            </button>
            <div className="flex shrink-0 items-center pr-3">
              <Button
                type="button"
                variant="secondary"
                className="h-9 gap-1.5 px-4 py-0 text-xs font-semibold"
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  onJoin(item.sessionId);
                }}
              >
                {rowBusy ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
                    <span className="sr-only">Joining</span>
                  </>
                ) : (
                  'Join'
                )}
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
