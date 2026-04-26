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
    try {
      const { data } = await api.post<Session>('/api/session/create', { title: title.trim() });
      goRoom(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create session');
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
    try {
      const { data } = await api.post<Session>(`/api/session/join/${id}`);
      goRoom(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not join session');
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
            <Input label="Session title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Button type="button" onClick={createSession} disabled={busy !== null} className="w-full">
              {busy === 'create' ? 'Creating…' : 'Create & enter room'}
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
            />
            <Button
              type="button"
              variant="secondary"
              onClick={joinSession}
              disabled={busy !== null}
              className="w-full"
            >
              {busy === 'join' ? 'Joining…' : 'Join room'}
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
