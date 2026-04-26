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
  const [busy, setBusy] = useState<'create' | 'join' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const goRoom = (s: Session) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(
        'roomMeta',
        JSON.stringify({ title: s.title, hostId: s.hostId, sessionId: s.id }),
      );
    }
    router.push(`/room/${s.id}`);
  };

  const createSession = async () => {
    setError(null);
    if (!title.trim()) {
      setError('Enter a session title');
      return;
    }
    setBusy('create');

    const attemptCreate = async (isRetry: boolean) => {
      console.log(isRetry ? 'Retrying session creation…' : 'Creating session…');
      const { data } = await api.post<Session>('/api/session/create', { title: title.trim() });
      console.log('Response:', data);
      return data;
    };

    try {
      try {
        const data = await attemptCreate(false);
        goRoom(data);
      } catch (first) {
        if (isTimeoutError(first)) {
          console.log('Session create timed out; retrying once…');
          try {
            const data = await attemptCreate(true);
            goRoom(data);
          } catch (retryErr) {
            throw retryErr;
          }
        } else {
          throw first;
        }
      }
    } catch (e) {
      if (isTimeoutError(e)) {
        setError('Server is taking too long. Please try again.');
      } else {
        setError('Failed to create session');
      }
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

    const attemptJoin = async (isRetry: boolean) => {
      console.log(isRetry ? 'Retrying session join…' : 'Joining session…');
      const { data } = await api.post<Session>(`/api/session/join/${id}`);
      console.log('Response:', data);
      return data;
    };

    try {
      try {
        const data = await attemptJoin(false);
        goRoom(data);
      } catch (first) {
        if (isTimeoutError(first)) {
          console.log('Session join timed out; retrying once…');
          try {
            const data = await attemptJoin(true);
            goRoom(data);
          } catch (retryErr) {
            throw retryErr;
          }
        } else {
          throw first;
        }
      }
    } catch (e) {
      if (isTimeoutError(e)) {
        setError('Server is taking too long. Please try again.');
      } else {
        setError('Failed to join session');
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <AppShell
      title="Dashboard"
      right={
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-slate-400 sm:inline">{user?.email}</span>
          <Button variant="secondary" type="button" onClick={() => logout()}>
            Sign out
          </Button>
        </div>
      }
    >
      {!API_BASE_URL && (
        <p className="mb-6 rounded-lg border border-amber-800 bg-amber-950/40 px-4 py-3 text-sm text-amber-100">
          Set <code className="font-mono">NEXT_PUBLIC_API_URL</code> in <code className="font-mono">.env.local</code>.
        </p>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <h2 className="text-lg font-semibold text-white">Create session</h2>
          <p className="mt-1 text-sm text-slate-400">Start a new discussion room as host.</p>
          <div className="mt-4 space-y-4">
            <Input
              label="Session title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={busy === 'create'}
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
                'Create & enter room'
              )}
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <h2 className="text-lg font-semibold text-white">Join session</h2>
          <p className="mt-1 text-sm text-slate-400">Paste the session ID from your host.</p>
          <div className="mt-4 space-y-4">
            <Input
              label="Session ID"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder="e.g. Mongo ObjectId / UUID"
              disabled={busy === 'join'}
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

      {error && (
        <p className="mt-6 rounded-lg bg-rose-950/50 px-4 py-3 text-sm text-rose-100">{error}</p>
      )}

      <p className="mt-10 text-center text-xs text-slate-500">
        Need an account? <Link href="/signup" className="text-violet-400 hover:underline">Sign up</Link>
      </p>
    </AppShell>
  );
}
