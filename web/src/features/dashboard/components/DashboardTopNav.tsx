'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DASHBOARD_NAV, isDashboardNavActive } from '../utils/dashboardNav';
import { BarChart2, History, LayoutDashboard, MessageSquare, User } from 'lucide-react';

const ICONS = {
  '/dashboard': LayoutDashboard,
  '/dashboard/sessions': MessageSquare,
  '/dashboard/history': History,
  '/dashboard/analytics': BarChart2,
  '/dashboard/profile': User,
} as const;

export function DashboardTopNav() {
  const pathname = usePathname() || '/dashboard';

  return (
    <nav className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide" aria-label="Dashboard sections">
      {DASHBOARD_NAV.map((item) => {
        const active = isDashboardNavActive(item.href, pathname);
        const Icon = ICONS[item.href as keyof typeof ICONS] ?? LayoutDashboard;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm transition-all duration-200 whitespace-nowrap',
              active
                ? 'bg-violet-600/20 font-medium text-violet-200 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] ring-1 ring-violet-500/35 backdrop-blur-sm'
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
