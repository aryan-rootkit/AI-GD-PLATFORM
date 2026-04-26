'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GuestGuard } from '@/components/layout/GuestGuard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GuestGuard>
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl backdrop-blur">
          <h1 className="text-2xl font-semibold text-white">Sign in</h1>
          <p className="mt-1 text-sm text-slate-400">Use your AI GD account.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && (
              <p className="rounded-lg bg-rose-950/50 px-3 py-2 text-sm text-rose-200">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Continue'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            No account?{' '}
            <Link href="/signup" className="font-medium text-violet-400 hover:text-violet-300">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </GuestGuard>
  );
}
