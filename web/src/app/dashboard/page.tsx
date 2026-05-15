'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useRoomMeta } from '@/hooks/useRoomMeta';
import { useLeaveSessionMutation } from '@/features/dashboard/hooks/useDashboardQueries';
import { useRecentSessions } from '@/hooks/useRecentSessions';

import { ActiveSessionBanner } from '@/features/dashboard/components/ActiveSessionBanner';
import { ActivitySummaryCards } from '@/features/dashboard/components/ActivitySummaryCards';
import { AIFeedbackPreviewWidget } from '@/features/dashboard/components/AIFeedbackPreviewWidget';
import { SessionManagerModal } from '@/features/dashboard/components/SessionManagerModal';
import { Button } from '@/components/ui/Button';
import { FlashNotice } from '@/components/ui/FlashNotice';
import { consumeSessionFlash, setSessionFlash, type SessionFlashKind } from '@/utils/sessionFlash';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { AchievementsCard } from '@/features/dashboard/components/AchievementsCard';
import { Mic2, Target } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { roomMeta, hasActiveRoom, refreshRoomMeta, clearRoomMeta } = useRoomMeta();
  const { rememberSession } = useRecentSessions();
  const leaveMutation = useLeaveSessionMutation();

  const [isModalOpen, setModalOpen] = useState(false);
  const [dashboardNotice, setDashboardNotice] = useState<string | null>(null);

  useEffect(() => {
    const flash = consumeSessionFlash();
    if (flash?.kind === 'ended') {
      setDashboardNotice('Session ended successfully.');
    }
  }, []);

  const handleSessionReady = (s: { title: string; id: string; hostId?: string }, entry?: SessionFlashKind) => {
    rememberSession({ title: s.title, id: s.id });
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('roomMeta', JSON.stringify({ title: s.title, hostId: s.hostId, sessionId: s.id }));
      if (entry && entry !== 'ended') setSessionFlash({ kind: entry });
      refreshRoomMeta();
    }
    setModalOpen(false);
    router.push(`/session/${s.id}`);
  };

  const handleLeaveSession = async () => {
    if (!roomMeta?.sessionId) return;
    try {
      await leaveMutation.mutateAsync(roomMeta.sessionId);
      clearRoomMeta();
      setDashboardNotice('You left the session.');
    } catch (e) {
      const err = e as Error & { status?: number };
      if (err.status === 404 || err.status === 400 || err.status === 403) {
        clearRoomMeta();
        setDashboardNotice('Session was cleared on this device.');
      }
    }
  };

  return (
    <div className="min-w-0 space-y-8 animate-in fade-in duration-500 pb-20">
      {dashboardNotice && (
        <FlashNotice message={dashboardNotice} onDismiss={() => setDashboardNotice(null)} />
      )}

      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Command Center</h1>
          <p className="mt-2 text-sm text-slate-400">Manage your active discussions and track AI-driven feedback.</p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          disabled={hasActiveRoom}
          className="gap-2 shadow-lg shadow-violet-900/20 transition-all hover:scale-105"
        >
          <Plus className="h-4 w-4" />
          Start Session
        </Button>
      </div>

      {hasActiveRoom && roomMeta && (
        <ActiveSessionBanner
          roomMeta={roomMeta}
          onResume={() => router.push(`/session/${roomMeta.sessionId}`)}
          onLeave={handleLeaveSession}
          leaveBusy={leaveMutation.isPending}
          resumeDisabled={leaveMutation.isPending}
        />
      )}

      <ActivitySummaryCards />

      <div className="grid gap-8 lg:grid-cols-2">
        <AIFeedbackPreviewWidget />
        <AchievementsCard
          title="Your Achievements"
          description="Preview — full progression and unlocks coming soon."
          progress={45}
          score={[
            { label: 'Top Score', value: 9, max: 10 },
            { label: 'Sessions Count', value: 12 }
          ]}
          badge={[
            { id: 'top-speaker', label: 'Top Speaker', icon: Mic2 },
            { id: 'best-argument', label: 'Best Argument', icon: Target }
          ]}
        />
      </div>

      <SessionManagerModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSessionReady={handleSessionReady}
        blockNewSession={hasActiveRoom}
      />

      {!user && (
        <p className="mt-8 text-center text-xs text-slate-500">
          Need an account?{' '}
          <Link href="/signup" className="text-violet-400 hover:text-violet-300 transition-colors">
            Sign up
          </Link>
        </p>
      )}
    </div>
  );
}
