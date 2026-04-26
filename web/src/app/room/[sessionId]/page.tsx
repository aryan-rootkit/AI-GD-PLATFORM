'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { MessageComposer } from '@/components/chat/MessageComposer';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import type { ChatPayload, Session } from '@/types/session';

type RoomMeta = { title?: string; hostId?: string; sessionId?: string };

function readRoomMeta(sessionId: string): RoomMeta {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem('roomMeta');
    if (!raw) return {};
    const m = JSON.parse(raw) as RoomMeta;
    return m.sessionId === sessionId ? m : {};
  } catch {
    return {};
  }
}

export default function RoomPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params.sessionId;
  const router = useRouter();
  const { user, logout } = useAuth();
  const socket = useSocket();

  const [meta, setMeta] = useState<RoomMeta>({});
  const [messages, setMessages] = useState<ChatPayload[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [hydrating, setHydrating] = useState(true);
  const [ending, setEnding] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  /** Restore room header after refresh; if unknown session, leave room. */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setHydrating(true);
      setError(null);
      let m = readRoomMeta(sessionId);
      if (!m.title && !m.hostId) {
        try {
          const { data } = await api.get<Session>(`/api/session/${sessionId}`);
          if (cancelled) return;
          m = { title: data.title, hostId: data.hostId, sessionId: data.id };
          sessionStorage.setItem('roomMeta', JSON.stringify(m));
        } catch {
          if (!cancelled) router.replace('/dashboard');
          return;
        }
      }
      if (cancelled) return;
      setMeta(m);

      try {
        const { data } = await api.get<ChatPayload[]>(`/api/session/${sessionId}/messages`);
        if (!cancelled) setMessages(data);
      } catch {
        if (!cancelled) setError('Could not load message history');
      } finally {
        if (!cancelled) setHydrating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId, router]);

  const emitJoin = useCallback(() => {
    if (!socket?.connected || !sessionId) return;
    socket.emit('join_room', { sessionId });
  }, [socket, sessionId]);

  useEffect(() => {
    if (!socket || !sessionId) return;

    emitJoin();
    socket.on('connect', emitJoin);

    const onReceive = (msg: ChatPayload) => {
      if (msg.sessionId !== sessionId) return;
      setRoomError(null);
      setMessages((prev) => {
        if (msg.id && prev.some((p) => p.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };

    const onRoomError = (payload: { sessionId?: string; message?: string }) => {
      if (payload.sessionId && payload.sessionId !== sessionId) return;
      setRoomError(payload.message || 'Room error');
    };

    socket.on('receive_message', onReceive);
    socket.on('room_error', onRoomError);

    return () => {
      socket.off('connect', emitJoin);
      socket.off('receive_message', onReceive);
      socket.off('room_error', onRoomError);
    };
  }, [socket, sessionId, emitJoin]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!socket?.connected) {
        setError('Socket not connected yet');
        return;
      }
      setError(null);
      setRoomError(null);
      socket.emit('send_message', { sessionId, text });
    },
    [socket, sessionId],
  );

  const endSession = async () => {
    if (!meta.hostId || user?.id !== meta.hostId) return;
    setEnding(true);
    setError(null);
    try {
      await api.post(`/api/session/end/${sessionId}`);
      sessionStorage.removeItem('roomMeta');
      router.replace('/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not end session');
    } finally {
      setEnding(false);
    }
  };

  const title = meta.title || 'Discussion room';
  const isHost = Boolean(meta.hostId && user?.id === meta.hostId);

  return (
    <AppShell
      title={title}
      right={
        <div className="flex items-center gap-2">
          <Button variant="secondary" type="button" onClick={() => router.push('/dashboard')}>
            Back
          </Button>
          <Button variant="secondary" type="button" onClick={() => logout()}>
            Sign out
          </Button>
        </div>
      }
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">{title}</h1>
          <p className="text-xs text-slate-500">Session · {sessionId}</p>
        </div>
        {isHost && (
          <Button variant="danger" type="button" onClick={endSession} disabled={ending}>
            {ending ? 'Ending…' : 'End session (host)'}
          </Button>
        )}
      </div>

      {hydrating && (
        <p className="mb-4 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-300">
          Loading room…
        </p>
      )}
      {!socket && (
        <p className="mb-4 rounded-lg border border-amber-800 bg-amber-950/30 px-3 py-2 text-sm text-amber-100">
          Connecting real-time… (sign in if this hangs)
        </p>
      )}
      {roomError && (
        <p className="mb-4 rounded-lg border border-amber-800 bg-amber-950/30 px-3 py-2 text-sm text-amber-100">
          {roomError}
        </p>
      )}
      {error && (
        <p className="mb-4 rounded-lg bg-rose-950/50 px-3 py-2 text-sm text-rose-100">{error}</p>
      )}

      <div className="flex h-[min(70vh,640px)] flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
        <div
          ref={listRef}
          className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
        >
          {!hydrating && messages.length === 0 && (
            <p className="text-center text-sm text-slate-500">No messages yet. Start the discussion.</p>
          )}
          {messages.map((m) => (
            <ChatBubble key={m.id || `${m.at}-${m.userId}-${m.text.slice(0, 24)}`} msg={m} selfId={user?.id} />
          ))}
        </div>
        <MessageComposer disabled={!socket?.connected || hydrating} onSend={sendMessage} />
      </div>
    </AppShell>
  );
}
