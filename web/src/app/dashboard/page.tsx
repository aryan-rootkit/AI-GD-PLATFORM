'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { Session } from '@/types/session';
import { API_BASE_URL } from '@/utils/constants';
import { MessageSquare, Plus, Users, Zap } from 'lucide-react';

function isTimeoutError(e: unknown): boolean {
  if (e && typeof e === 'object' && 'code' in e && (e as { code?: string }).code === 'ECONNABORTED') {
    return true;
  }
  if (e instanceof Error && e.message.toLowerCase().includes('timeout')) {
    return true;
  }
  return false;
}

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
  const { user, logout } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [busy, setBusy] = useState<'create' | 'join' | 'start' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const goSession = (s: Session) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(
        'roomMeta',
        JSON.stringify({ title: s.title, hostId: s.hostId, sessionId: s.id }),
      );
    }
    router.push(`/session/${s.id}`);
  };

  const startLiveSession = async () => {
    setError(null);
    setBusy('start');
    try {
      const { data } = await api.post<Session>('/api/session/create', { title: 'New Session' });
      if (data?.id) goSession(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start session');
    } finally {
      setBusy(null);
    }
  };

  const createSession = async () => {
    setError(null);
    if (!title.trim()) {
      setError('Enter a session title');
      return;
    }
    setBusy('create');
    const attempt = async () => {
      const { data } = await api.post<Session>('/api/session/create', { title: title.trim() });
      return data;
    };
    try {
      try {
        const data = await attempt();
        goSession(data);
      } catch (first) {
        if (isTimeoutError(first)) {
          const data = await attempt();
          goSession(data);
        } else {
          throw first;
        }
      }
    } catch (e) {
      setError(isTimeoutError(e) ? 'Server is taking too long. Please try again.' : 'Failed to create session');
    } finally {
      setBusy(null);
    }
  };

  const joinSession = async () => {
    setError(null);
    const id = sessionId.trim();
    if (!id) {
      setError('Enter a session ID');
      return;
    }
    setBusy('join');
    const attempt = async () => {
      const { data } = await api.post<Session>(`/api/session/join/${id}`);
      return data;
    };
    try {
      try {
        const data = await attempt();
        goSession(data);
      } catch (first) {
        if (isTimeoutError(first)) {
          goSession(await attempt());
        } else {
          throw first;
        }
      }
    } catch (e) {
      setError(isTimeoutError(e) ? 'Server is taking too long. Please try again.' : 'Failed to join session');
    } finally {
      setBusy(null);
    }
  };

  return (
    <AppShell
      title="Dashboard"
      right={
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden max-w-[12rem] truncate text-slate-400 sm:inline">
            {user?.name || user?.email}
          </span>
          <Button variant="secondary" type="button" onClick={() => logout()}>
            Sign out
          </Button>
        </div>
      }
    >
      {!API_BASE_URL && (
        <p className="mb-6 rounded-lg border border-amber-800 bg-amber-950/40 px-4 py-3 text-sm text-amber-100">
          Set <code className="font-mono">NEXT_PUBLIC_API_URL</code> in <code className="font-mono">.env.local</code>{' '}
          and restart the dev server.
        </p>
      )}

      <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-[10rem_1fr]">
        <aside className="hidden flex-col gap-1 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-2 sm:flex sm:p-3">
          <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Navigate</p>
          <div className="rounded-lg bg-slate-800/60 p-2 text-slate-200">
            <MessageSquare className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            <p className="mt-1 text-xs font-medium">Discussions</p>
          </div>
          <div className="mt-1 rounded-lg p-2 text-slate-500">
            <Users className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            <p className="mt-1 text-xs">Cohort (soon)</p>
          </div>
        </aside>

        <div className="min-w-0 space-y-6">
          <section
            className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-950/40 to-slate-900/50 p-6 sm:p-8"
            aria-label="Start live"
          >
            <div
              className="pointer-events-none absolute -right-4 top-0 h-32 w-32 rounded-full bg-violet-600/20 blur-2xl"
              aria-hidden
            />
            <div className="relative z-[1] flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-violet-300/90">
                  Live room
                </p>
                <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">Start a live session</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Creates a room, opens the Discord-style layout, and keeps real-time messages on.
                </p>
              </div>
              <Button
                type="button"
                onClick={startLiveSession}
                disabled={busy !== null}
                className="w-full min-w-0 gap-2 px-5 py-3.5 sm:w-auto sm:shrink-0"
              >
                {busy === 'start' ? (
                  <>
                    <Spinner />
                    Starting…
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" strokeWidth={2.5} />
                    Start live session
                  </>
                )}
              </Button>
            </div>
          </section>

          <div className="grid gap-6 md:grid-cols-2">
            <section className="rounded-2xl border border-slate-800/90 bg-slate-900/40 p-5 sm:p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                <Plus className="h-5 w-5 text-violet-400" strokeWidth={2} aria-hidden />
                Create session
              </h2>
              <p className="mt-1 text-sm text-slate-400">Name your room, then join as host.</p>
              <div className="mt-4 space-y-3">
                <Input
                  label="Session title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={busy === 'create' || busy === 'start'}
                />
                <Button
                  type="button"
                  onClick={createSession}
                  disabled={busy !== null}
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
            </section>

            <section className="rounded-2xl border border-slate-800/90 bg-slate-900/40 p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-white">Join session</h2>
              <p className="mt-1 text-sm text-slate-400">Paste a session id from the host.</p>
              <div className="mt-4 space-y-3">
                <Input
                  label="Session ID"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  disabled={busy === 'join' || busy === 'start'}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={joinSession}
                  disabled={busy !== null}
                  className="w-full gap-2"
                >
                  {busy === 'join' ? (
                    <>
                      <Spinner />
                      Joining…
                    </>
                  ) : (
                    'Join room'
                  )}
                </Button>
              </div>
            </section>
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-rose-950/50 px-4 py-3 text-sm text-rose-100">{error}</p>
      )}

      <p className="mt-8 text-center text-xs text-slate-500">
        Need an account?{' '}
        <Link href="/signup" className="text-violet-400 hover:underline">
          Sign up
        </Link>
      </p>
    </AppShell>
  );
}
