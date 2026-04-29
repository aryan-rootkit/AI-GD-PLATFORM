'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DASHBOARD_NAV, isDashboardNavActive } from '@/components/dashboard/dashboardNav';
import { BarChart2, History, LayoutDashboard, MessageSquare, User } from 'lucide-react';

const ICONS = {
  '/dashboard': LayoutDashboard,
  '/dashboard/sessions': MessageSquare,
  '/dashboard/history': History,
  '/dashboard/analytics': BarChart2,
  '/dashboard/profile': User,
} as const;

export function DashboardSidebarNav() {
  const pathname = usePathname() || '/dashboard';

  return (
    <nav className="flex flex-col gap-0.5" aria-label="Dashboard sections">
      <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Menu</p>
      {DASHBOARD_NAV.map((item) => {
        const active = isDashboardNavActive(item.href, pathname);
        const Icon = ICONS[item.href as keyof typeof ICONS] ?? LayoutDashboard;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              'flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition',
              active
                ? 'bg-violet-600/20 font-medium text-violet-200 ring-1 ring-violet-500/35'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200',
            ].join(' ')}
            aria-current={active ? 'page' : undefined}
          >
            <Icon className="h-4 w-4 shrink-0 opacity-90" strokeWidth={1.75} aria-hidden />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
