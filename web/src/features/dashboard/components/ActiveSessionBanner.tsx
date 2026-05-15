'use client';

import type { StoredRoomMeta } from '@/utils/roomMeta';
import { Button } from '@/components/ui/Button';
import { Radio } from 'lucide-react';

type Props = {
  roomMeta: StoredRoomMeta;
  onResume: () => void;
  onLeave: () => void;
  leaveBusy: boolean;
  resumeDisabled: boolean;
};

export function ActiveSessionBanner({
  roomMeta,
  onResume,
  onLeave,
  leaveBusy,
  resumeDisabled,
}: Props) {
  return (
    <div
      className="flex flex-col gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/30 px-4 py-4 backdrop-blur-md shadow-lg shadow-emerald-900/20 sm:flex-row sm:items-center sm:justify-between sm:px-5"
      role="status"
      aria-live="polite"
    >
      <div className="flex min-w-0 gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400"
          aria-hidden
        >
          <Radio className="h-5 w-5 animate-pulse" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-emerald-50">You are in an active session</p>
          <p className="mt-0.5 truncate text-sm text-emerald-200/70" title={roomMeta.title}>
            {roomMeta.title}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
        <Button
          type="button"
          onClick={onResume}
          disabled={resumeDisabled}
          className="w-full gap-2 sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white"
        >
          Resume Session
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onLeave}
          disabled={leaveBusy || resumeDisabled}
          className="w-full gap-2 sm:w-auto"
        >
          {leaveBusy ? (
            <>
              <span
                className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-slate-400 border-t-transparent"
                aria-hidden
              />
              Leaving…
            </>
          ) : (
            'Leave Session'
          )}
        </Button>
      </div>
    </div>
  );
}
