import type { ReactNode } from 'react';
import { AuthGuard } from '@/components/layout/AuthGuard';

export default function RoomLayout({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
