export type DashboardNavItem = {
  href: string;
  label: string;
  /** Shown in the top header next to the logo */
  title: string;
};

export const DASHBOARD_NAV: DashboardNavItem[] = [
  { href: '/dashboard', label: 'Dashboard', title: 'Dashboard' },
  { href: '/dashboard/sessions', label: 'Sessions', title: 'Sessions' },
  { href: '/dashboard/history', label: 'History', title: 'History' },
  { href: '/dashboard/analytics', label: 'Analytics', title: 'Analytics' },
  { href: '/dashboard/profile', label: 'Profile', title: 'Profile' },
];

function normalizePath(pathname: string): string {
  const p = pathname.replace(/\/$/, '');
  return p === '' ? '/dashboard' : p;
}

export function dashboardSectionTitle(pathname: string): string {
  const p = normalizePath(pathname);
  const hit = DASHBOARD_NAV.find((item) => item.href === p);
  return hit?.title ?? 'Dashboard';
}

export function isDashboardNavActive(href: string, pathname: string): boolean {
  const p = normalizePath(pathname);
  const h = normalizePath(href);
  if (h === '/dashboard') return p === '/dashboard';
  return p === h;
}
