'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { Session } from '@/types/session';

export default function JoinSessionPage() {
  const params = useParams();
  const router = useRouter();
  const { user, ready } = useAuth();
  const sessionId = typeof params.sessionId === 'string' ? params.sessionId : '';
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !sessionId) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(`/join/${sessionId}`)}`);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.post<Session>(`/api/session/join/${sessionId}`);
        if (cancelled) return;
        router.replace(`/session/${data.id}`);
      } catch {
        if (!cancelled) {
          setError('Could not join this session. It may be full or no longer active.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, user, sessionId, router]);

  if (error) {
    return (
      <div className="mx-auto max-w-md p-8 text-center text-slate-300">
        <p>{error}</p>
        <button
          type="button"
          className="mt-4 text-violet-400 underline"
          onClick={() => router.replace('/dashboard')}
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[40vh] items-center justify-center p-6 text-sm text-slate-500">
      Joining session…
    </div>
  );
}
