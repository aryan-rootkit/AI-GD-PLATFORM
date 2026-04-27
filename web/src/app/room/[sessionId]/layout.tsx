import type { ReactNode } from 'react';

/** Room URL redirects to `/session/[id]`; no client shell here. */
export default function RoomLayout({ children }: { children: ReactNode }) {
  return children;
}
