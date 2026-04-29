'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ActiveSessionBanner } from '@/components/dashboard/ActiveSessionBanner';
import { RecentSessionsList } from '@/components/dashboard/RecentSessionsList';
import { AchievementsCard } from '@/components/dashboard/AchievementsCard';
import { AIFeedbackPreviewCard } from '@/components/dashboard/AIFeedbackPreviewCard';
import { UserActivityOverviewCard } from '@/components/dashboard/UserActivityOverviewCard';
import { Button } from '@/components/ui/Button';
import { FlashNotice } from '@/components/ui/FlashNotice';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useRecentSessions } from '@/hooks/useRecentSessions';
import { useRoomMeta } from '@/hooks/useRoomMeta';
import { useAIFeedbackPreview } from '@/hooks/useAIFeedbackPreview';
import { useUserActivityOverview } from '@/hooks/useUserActivityOverview';
import type { Session, SessionTopicKind } from '@/types/session';
import { API_BASE_URL } from '@/utils/constants';
import { consumeSessionFlash, setSessionFlash, type SessionFlashKind } from '@/utils/sessionFlash';
import { ArrowLeft, LogIn, Plus, Sparkles } from 'lucide-react';

type TopicPreset = Exclude<SessionTopicKind, 'auto'>;
type SessionPanelMode = 'pick' | 'create' | 'join';

function isTimeoutError(e: unknown): boolean {
  if (e && typeof e === 'object' && 'code' in e && (e as { code?: string }).code === 'ECONNABORTED') {
    return true;
  }
  if (e instanceof Error && e.message.toLowerCase().includes('timeout')) {
    return true;
  }
  return false;
}

function getApiErrorStatus(e: unknown): number | undefined {
  if (e && typeof e === 'object' && 'status' in e && typeof (e as { status?: unknown }).status === 'number') {
    return (e as { status: number }).status;
  }
  return undefined;
}

function sessionActionErrorMessage(e: unknown, fallback: string): string {
  if (isTimeoutError(e)) {
    return 'Server is taking too long. Please try again.';
  }
  if (getApiErrorStatus(e) === 401) {
    return 'Sign-in required or your session expired. Sign out, sign in again, then retry. Each person joining needs their own account.';
  }
  if (e instanceof Error && e.message) {
    return e.message;
  }
  return fallback;
}

const ALREADY_IN_SESSION_HINT =
  'You are already in a session. Open that room and use Back or End before creating another.';

function Spinner() {
  return (
    <svg
      className="h-4 w-4 shrink-0 animate-spin text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { roomMeta, hasActiveRoom, refreshRoomMeta, clearRoomMeta } = useRoomMeta();
  const { overview: activityOverview, loading: activityLoading } = useUserActivityOverview(hasActiveRoom);
  const aiFeedbackPreview = useAIFeedbackPreview();
  const { recentSessions, rememberSession } = useRecentSessions();
  const [title, setTitle] = useState('');
  const [topicAuto, setTopicAuto] = useState(false);
  const [topicPreset, setTopicPreset] = useState<TopicPreset>('business');
  const [topicCustomText, setTopicCustomText] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [joinTargetId, setJoinTargetId] = useState<string | null>(null);
  const [leaveBusy, setLeaveBusy] = useState(false);
  const [sessionPanelOpen, setSessionPanelOpen] = useState(false);
  const [sessionPanelMode, setSessionPanelMode] = useState<SessionPanelMode>('pick');
  const [busy, setBusy] = useState<'create' | 'join' | null>(null);
  const [practiceBusy, setPracticeBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardNotice, setDashboardNotice] = useState<string | null>(null);

  const blockNewSession = hasActiveRoom;

  useEffect(() => {
    const flash = consumeSessionFlash();
    if (flash?.kind === 'ended') {
      setDashboardNotice('Session ended successfully.');
    }
  }, []);

  const openSessionPanel = () => {
    setError(null);
    setSessionPanelOpen(true);
    setSessionPanelMode('pick');
  };

  const closeSessionPanel = () => {
    setSessionPanelOpen(false);
    setSessionPanelMode('pick');
  };

  const goPickMode = () => {
    setSessionPanelMode('pick');
    setError(null);
  };

  const goSession = (s: Session, entry?: SessionFlashKind) => {
    rememberSession({ title: s.title, id: s.id });
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(
        'roomMeta',
        JSON.stringify({ title: s.title, hostId: s.hostId, sessionId: s.id }),
      );
      if (entry && entry !== 'ended') {
        setSessionFlash({ kind: entry });
      }
      refreshRoomMeta();
    }
    router.push(`/session/${s.id}`);
  };

  const createSession = async () => {
    setError(null);
    if (!title.trim()) {
      setError('Enter a session title');
      return;
    }
    if (!topicAuto && topicPreset === 'custom' && !topicCustomText.trim()) {
      setError('Describe your custom topic');
      return;
    }
    setBusy('create');
    const buildCreateBody = (): Record<string, unknown> => {
      if (topicAuto) {
        return { title: title.trim(), topic: 'auto' };
      }
      if (topicPreset === 'custom') {
        return { title: title.trim(), topic: { custom: topicCustomText.trim() } };
      }
      return { title: title.trim(), topic: { preset: topicPreset } };
    };
    const attempt = async () => {
      const { data } = await api.post<Session>('/api/session/create', buildCreateBody());
      return data;
    };
    try {
      try {
        const data = await attempt();
        goSession(data, 'created');
      } catch (first) {
        if (isTimeoutError(first)) {
          const data = await attempt();
          goSession(data, 'created');
        } else {
          throw first;
        }
      }
    } catch (e) {
      setError(sessionActionErrorMessage(e, 'Failed to create session'));
    } finally {
      setBusy(null);
    }
  };

  const joinSession = async (explicitSessionId?: string) => {
    setError(null);
    const id = (explicitSessionId ?? sessionId).trim();
    if (!id) {
      setError('Enter a session ID');
      return;
    }
    if (explicitSessionId !== undefined) {
      setSessionId(explicitSessionId);
    }
    setJoinTargetId(id);
    setBusy('join');
    const attempt = async () => {
      const { data } = await api.post<Session>(`/api/session/join/${id}`);
      return data;
    };
    try {
      try {
        const data = await attempt();
        goSession(data, 'joined');
      } catch (first) {
        if (isTimeoutError(first)) {
          goSession(await attempt(), 'joined');
        } else {
          throw first;
        }
      }
    } catch (e) {
      setError(sessionActionErrorMessage(e, 'Failed to join session'));
    } finally {
      setBusy(null);
      setJoinTargetId(null);
    }
  };

  const startPracticeSession = async () => {
    setError(null);
    setPracticeBusy(true);
    try {
      const { data } = await api.post<Session>('/api/session/create', {
        title: 'Practice with AI',
        isPractice: true,
      });
      if (data?.id) goSession(data, 'practice');
    } catch (e) {
      setError(sessionActionErrorMessage(e, 'Could not start practice session'));
    } finally {
      setPracticeBusy(false);
    }
  };

  const leaveActiveSession = async () => {
    if (!roomMeta?.sessionId) return;
    setError(null);
    if (!API_BASE_URL) {
      clearRoomMeta();
      setDashboardNotice('Active session cleared on this device.');
      return;
    }
    setLeaveBusy(true);
    try {
      await api.post(`/api/session/leave/${roomMeta.sessionId}`);
      clearRoomMeta();
      setDashboardNotice('You left the session. Start or join another anytime.');
    } catch (e) {
      const st = getApiErrorStatus(e);
      if (st === 404 || st === 400 || st === 403) {
        clearRoomMeta();
        setDashboardNotice('Session was cleared on this device.');
      } else {
        setError(sessionActionErrorMessage(e, 'Could not leave session'));
      }
    } finally {
      setLeaveBusy(false);
    }
  };

  return (
    <>
      {!API_BASE_URL && (
        <p className="mb-6 rounded-lg border border-amber-800 bg-amber-950/40 px-4 py-3 text-sm text-amber-100">
          Set <code className="font-mono">NEXT_PUBLIC_API_URL</code> in <code className="font-mono">.env.local</code>{' '}
          and restart the dev server.
        </p>
      )}

      <div className="min-w-0 space-y-6">
          {dashboardNotice && (
            <FlashNotice message={dashboardNotice} onDismiss={() => setDashboardNotice(null)} />
          )}

          <UserActivityOverviewCard overview={activityOverview} loading={activityLoading} />

          <AIFeedbackPreviewCard state={aiFeedbackPreview} />

          <AchievementsCard />

          {hasActiveRoom && roomMeta && (
            <ActiveSessionBanner
              roomMeta={roomMeta}
              onResume={() => router.push(`/session/${roomMeta.sessionId}`)}
              onLeave={leaveActiveSession}
              leaveBusy={leaveBusy}
              resumeDisabled={busy !== null || leaveBusy || practiceBusy}
            />
          )}

          <section
            className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-950/40 to-slate-900/50 p-6 sm:p-8"
            aria-label="Start session"
          >
            <div
              className="pointer-events-none absolute -right-4 top-0 h-32 w-32 rounded-full bg-violet-600/20 blur-2xl"
              aria-hidden
            />
            <div className="relative z-[1] flex flex-col gap-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-violet-300/90">Live room</p>
                  <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">Start Session</h2>
                  <p className="mt-1 max-w-xl text-sm text-slate-400">
                    Create a room, join with an ID, or try <span className="text-slate-300">Practice with AI</span> for
                    solo reps—no invite needed.
                  </p>
                </div>
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:shrink-0 sm:items-stretch">
                  <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      onClick={openSessionPanel}
                      disabled={busy !== null || sessionPanelOpen || practiceBusy || blockNewSession}
                      aria-expanded={sessionPanelOpen}
                      title={blockNewSession ? 'You are already in a session' : undefined}
                      className="w-full min-w-0 px-6 py-3.5 text-base font-semibold shadow-lg shadow-violet-950/40 ring-2 ring-violet-400/35 sm:w-auto sm:min-w-[11rem]"
                    >
                      Start Session
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={startPracticeSession}
                      disabled={busy !== null || sessionPanelOpen || practiceBusy || blockNewSession}
                      title={blockNewSession ? 'You are already in a session' : undefined}
                      className="w-full min-w-0 gap-2 px-4 py-3 text-sm sm:w-auto"
                    >
                      {practiceBusy ? (
                        <>
                          <Spinner />
                          Starting…
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 shrink-0 text-amber-300/90" strokeWidth={2} aria-hidden />
                          Practice with AI
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {!sessionPanelOpen && !blockNewSession && (
                <p className="text-center text-xs text-slate-500 sm:text-left">
                  Tip: use <span className="font-medium text-slate-400">Start Session</span> for create / join options.
                </p>
              )}

              {sessionPanelOpen && (
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-4 sm:p-5">
                  <div className="mb-4 flex justify-end">
                    <button
                      type="button"
                      onClick={closeSessionPanel}
                      disabled={busy !== null}
                      className="text-xs font-medium text-slate-500 hover:text-slate-300 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                  {sessionPanelMode === 'pick' && (
                    <div className="space-y-4">
                      <p className="text-sm text-slate-300">Choose how to enter your next room.</p>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                          type="button"
                          className="flex-1 gap-2 py-3"
                          onClick={() => {
                            setError(null);
                            setSessionPanelMode('create');
                          }}
                          disabled={busy !== null || blockNewSession}
                          title={blockNewSession ? 'You are already in a session' : undefined}
                        >
                          <Plus className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                          Create New Session
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          className="flex-1 gap-2 py-3"
                          onClick={() => {
                            setError(null);
                            setSessionPanelMode('join');
                          }}
                          disabled={busy !== null}
                        >
                          <LogIn className="h-4 w-4 shrink-0 text-violet-400" strokeWidth={2} aria-hidden />
                          Join Existing Session
                        </Button>
                      </div>
                      {blockNewSession && (
                        <p className="text-xs text-amber-200/90">{ALREADY_IN_SESSION_HINT}</p>
                      )}
                    </div>
                  )}

                  {sessionPanelMode === 'create' && (
                    <div className="space-y-4">
                      <button
                        type="button"
                        onClick={goPickMode}
                        disabled={busy !== null}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 disabled:opacity-50"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                        Back to options
                      </button>
                      <p className="text-sm text-slate-400">Name your room, then join as host.</p>
                      {blockNewSession && (
                        <p className="text-xs text-amber-200/90">{ALREADY_IN_SESSION_HINT}</p>
                      )}
                      <div className="space-y-3">
                        <Input
                          label="Session title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          disabled={busy === 'create' || blockNewSession}
                        />
                        <div className="space-y-3 rounded-lg border border-slate-800/80 bg-slate-950/40 p-3">
                          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-200">
                            <input
                              type="checkbox"
                              checked={topicAuto}
                              onChange={(e) => setTopicAuto(e.target.checked)}
                              disabled={busy === 'create' || blockNewSession}
                              className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-violet-600 focus:ring-violet-500"
                            />
                            <span>Assign topic automatically</span>
                          </label>
                          {!topicAuto && (
                            <>
                              <label className="block space-y-1.5 text-sm">
                                <span className="text-slate-300">Discussion topic</span>
                                <select
                                  value={topicPreset}
                                  onChange={(e) => setTopicPreset(e.target.value as TopicPreset)}
                                  disabled={busy === 'create' || blockNewSession}
                                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                                >
                                  <option value="business">Business</option>
                                  <option value="technology">Technology</option>
                                  <option value="abstract">Abstract</option>
                                  <option value="custom">Custom</option>
                                </select>
                              </label>
                              {topicPreset === 'custom' && (
                                <Input
                                  label="Custom topic"
                                  value={topicCustomText}
                                  onChange={(e) => setTopicCustomText(e.target.value)}
                                  placeholder="What should participants explore?"
                                  disabled={busy === 'create' || blockNewSession}
                                />
                              )}
                            </>
                          )}
                        </div>
                        <Button
                          type="button"
                          onClick={createSession}
                          disabled={busy !== null || blockNewSession}
                          title={blockNewSession ? 'You are already in a session' : undefined}
                          className="w-full gap-2"
                        >
                          {busy === 'create' ? (
                            <>
                              <Spinner />
                              Creating…
                            </>
                          ) : (
                            'Create & open room'
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {sessionPanelMode === 'join' && (
                    <div className="space-y-4">
                      <button
                        type="button"
                        onClick={goPickMode}
                        disabled={busy !== null}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 disabled:opacity-50"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                        Back to options
                      </button>
                      <p className="text-sm text-slate-400">Rejoin a room you used before, or paste an ID from the host.</p>
                      <p className="text-xs text-slate-500">
                        Each participant must be signed in with their own account; the join request sends your auth
                        token to the server.
                      </p>
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Recent sessions</p>
                        <RecentSessionsList
                          items={recentSessions}
                          onRowClickFill={(id) => {
                            setSessionId(id);
                            setError(null);
                          }}
                          onJoin={(id) => joinSession(id)}
                          joinBusyForId={busy === 'join' ? joinTargetId : null}
                          disabled={busy !== null}
                        />
                      </div>
                      <div className="space-y-3 border-t border-slate-800/80 pt-4">
                        <p className="text-xs font-medium text-slate-500">Or enter a session ID manually</p>
                        <Input
                          label="Session ID"
                          value={sessionId}
                          onChange={(e) => setSessionId(e.target.value)}
                          disabled={busy === 'join'}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => joinSession()}
                          disabled={busy !== null}
                          className="w-full gap-2"
                        >
                          {busy === 'join' && joinTargetId === sessionId.trim() ? (
                            <>
                              <Spinner />
                              Joining…
                            </>
                          ) : (
                            'Join room'
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-rose-950/50 px-4 py-3 text-sm text-rose-100">{error}</p>
      )}

      {!user && (
        <p className="mt-8 text-center text-xs text-slate-500">
          Need an account?{' '}
          <Link href="/signup" className="text-violet-400 hover:underline">
            Sign up
          </Link>
        </p>
      )}
    </>
  );
}
