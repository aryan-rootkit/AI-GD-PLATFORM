'use client';

import { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';

export default function OnboardingPage() {
  const { user, completeOnboarding } = useAuth();
  const [name, setName] = useState('');

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    completeOnboarding(name.trim() || (user?.name ?? ''));
  };

  return (
    <AuthGuard>
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-8 shadow-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-400">
            Step 1 of 1
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">How we address you</h1>
          <p className="mt-1 text-sm text-slate-400">
            This name shows in live sessions. You can change it later from your profile
            (coming soon).
          </p>
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <Input
              label="Display name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aryan or Alex C."
            />
            <Button type="submit" className="w-full">
              Continue to dashboard
            </Button>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
}
