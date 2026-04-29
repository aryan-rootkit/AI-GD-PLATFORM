'use client';

import { useAuth } from '@/hooks/useAuth';

export default function DashboardProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-white">Profile</h1>
      <div className="rounded-xl border border-slate-800/90 bg-slate-900/40 px-4 py-3 text-sm">
        <p className="text-slate-500">Signed in as</p>
        <p className="mt-1 font-medium text-slate-100">{user?.name || '—'}</p>
        <p className="mt-0.5 text-slate-400">{user?.email}</p>
      </div>
      <p className="max-w-lg text-sm text-slate-500">Account settings and preferences will expand in a future update.</p>
    </div>
  );
}
