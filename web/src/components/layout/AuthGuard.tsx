'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

/**
 * Client-side guard (JWT is in localStorage — not readable from Next middleware).
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!token) router.replace('/login');
  }, [ready, token, router]);

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-400">
        Loading…
      </div>
    );
  }

  if (!token) return null;

  return <>{children}</>;
}
