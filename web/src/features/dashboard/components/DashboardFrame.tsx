'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DashboardSidebarNav } from './DashboardSidebarNav';
import { dashboardSectionTitle } from '../utils/dashboardNav';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

export function DashboardFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname() || '/dashboard';
  const title = dashboardSectionTitle(pathname);
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex min-w-0 items-center gap-6">
            <Link href="/dashboard" className="shrink-0 text-lg font-semibold tracking-tight text-white">
              AI GD
            </Link>
            <span className="max-w-[9rem] truncate text-sm text-slate-400 sm:max-w-md">{title}</span>
          </div>
          <div className="flex shrink-0 items-center gap-3 text-sm">
            <span className="hidden max-w-[12rem] truncate text-slate-400 sm:inline">
              {user?.name || user?.email}
            </span>
            <Button variant="secondary" type="button" onClick={() => logout()}>
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid min-h-0 gap-6 lg:grid-cols-[11.5rem_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-2 sm:p-3">
              <DashboardSidebarNav />
            </div>
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </main>
    </div>
  );
}
