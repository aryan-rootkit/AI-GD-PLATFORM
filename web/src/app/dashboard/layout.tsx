import type { ReactNode } from 'react';
import { DashboardFrame } from '@/features/dashboard/components/DashboardFrame';
import { AuthGuard } from '@/components/layout/AuthGuard';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <DashboardFrame>{children}</DashboardFrame>
    </AuthGuard>
  );
}
