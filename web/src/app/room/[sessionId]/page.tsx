import { redirect } from 'next/navigation';

type Props = { params: Promise<{ sessionId: string }> };

export default async function RoomToSessionPage({ params }: Props) {
  const { sessionId } = await params;
  redirect(`/session/${encodeURIComponent(sessionId)}`);
}
