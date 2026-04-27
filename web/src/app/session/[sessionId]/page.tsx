'use client';

import { useParams } from 'next/navigation';
import { SessionClient } from '@/components/session/SessionClient';

export default function SessionPage() {
  const params = useParams<{ sessionId: string }>();
  const id = String(params?.sessionId ?? '');

  if (!id) {
    return null;
  }

  return <SessionClient sessionId={id} key={id} />;
}
