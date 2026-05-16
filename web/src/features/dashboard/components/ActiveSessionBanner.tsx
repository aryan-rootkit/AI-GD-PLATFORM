'use client';

import { useState } from 'react';
import type { StoredRoomMeta } from '@/utils/roomMeta';
import { Button } from '@/components/ui/Button';
import { Radio, Users, ArrowRight, Loader2 } from 'lucide-react';
import { InviteParticipantsModal } from './InviteParticipantsModal';

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
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  return (
    <>
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

        <div className="mt-4 flex flex-wrap gap-2 sm:mt-0 sm:shrink-0">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setInviteModalOpen(true)}
            disabled={leaveBusy || resumeDisabled}
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            Invite
          </Button>

          <Button
            type="button"
            onClick={onResume}
            disabled={resumeDisabled}
            className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            Resume
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={onLeave}
            disabled={leaveBusy || resumeDisabled}
          >
            {leaveBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Leave'}
          </Button>
        </div>
      </div>

      <InviteParticipantsModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        sessionId={roomMeta.sessionId}
      />
    </>
  );
}
