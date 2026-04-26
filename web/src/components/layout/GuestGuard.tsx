'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

/** Redirect authenticated users away from login/signup. */
export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { token, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (token) router.replace('/dashboard');
  }, [ready, token, router]);

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-400">
        Loading…
      </div>
    );
  }

  if (token) return null;

  return <>{children}</>;
}
