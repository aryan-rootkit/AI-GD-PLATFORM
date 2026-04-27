'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Menu, MessageSquare, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MessageComposer } from '@/components/chat/MessageComposer';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { isAiMessage } from '@/lib/messages';
import { SessionAIPanel } from '@/components/session/SessionAIPanel';
import { SessionLeftSidebar } from '@/components/session/SessionLeftSidebar';
import { SessionMessageRow } from '@/components/session/SessionMessageRow';
import type { ChatPayload, Session } from '@/types/session';

type Props = { sessionId: string };

export function SessionClient({ sessionId }: Props) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const socket = useSocket();
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<ChatPayload[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [hydrating, setHydrating] = useState(true);
  const [ending, setEnding] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setHydrating(true);
      setError(null);
      try {
        const { data: s } = await api.get<Session>(`/api/session/${sessionId}`);
        if (cancelled) return;
        setSession(s);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(
            'roomMeta',
            JSON.stringify({ title: s.title, hostId: s.hostId, sessionId: s.id }),
          );
        }
        const { data: msgs } = await api.get<ChatPayload[]>(
          `/api/session/${sessionId}/messages`,
        );
        if (!cancelled) setMessages(msgs);
      } catch {
        if (!cancelled) router.replace('/dashboard');
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
      if (isAiMessage(msg)) {
        window.setTimeout(() => {
          setMessages((prev) => {
            if (msg.id && prev.some((p) => p.id === msg.id)) return prev;
            return [...prev, msg];
          });
          setShowTyping(false);
        }, 500);
        return;
      }
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
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, showTyping]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!socket?.connected) {
        setError('Not connected—wait for socket or refresh.');
        return;
      }
      setError(null);
      setRoomError(null);
      setShowTyping(true);
      window.setTimeout(() => setShowTyping(false), 1500);
      socket.emit('send_message', { sessionId, text });
    },
    [socket, sessionId],
  );

  const title = session?.title || 'Session';
  const isHost = Boolean(user?.id && session?.hostId && session.hostId === user.id);

  const participants = useMemo(() => {
    const raw = session?.participants;
    if (!raw || raw.length === 0) {
      if (user?.id) {
        return [
          {
            id: user.id,
            isSelf: true,
            online: true,
            label: user.name || user.email?.split('@')[0] || 'You',
          },
        ];
      }
      return [];
    }
    return raw.map((id) => ({
      id,
      isSelf: id === user?.id,
      online: true,
      label:
        id === user?.id
          ? user.name || user.email?.split('@')[0] || 'You'
          : `Member ${id.slice(0, 6)}…`,
    }));
  }, [session?.participants, user]);

  const endSession = async () => {
    if (!isHost) return;
    setEnding(true);
    setError(null);
    try {
      await api.post(`/api/session/end/${sessionId}`);
      sessionStorage.removeItem('roomMeta');
      router.replace('/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not end');
    } finally {
      setEnding(false);
    }
  };

  const onCreateFromSidebar = useCallback(() => {
    setCreateBusy(true);
    (async () => {
      try {
        const { data } = await api.post<Session>('/api/session/create', {
          title: 'New Session',
        });
        if (typeof window !== 'undefined' && data?.id) {
          sessionStorage.setItem(
            'roomMeta',
            JSON.stringify({
              title: data.title,
              hostId: data.hostId,
              sessionId: data.id,
            }),
          );
          router.push(`/session/${data.id}`);
        }
      } catch {
        setError('Could not create');
      } finally {
        setCreateBusy(false);
        setLeftOpen(false);
      }
    })();
  }, [router]);

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] min-h-0 w-full flex-col overflow-hidden bg-[#0a0a0b] text-slate-200">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-white/5 bg-[#0c0c0e] px-2 sm:px-0 lg:hidden">
        <button
          type="button"
          onClick={() => {
            setLeftOpen((v) => !v);
            setRightOpen(false);
          }}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-300 hover:bg-white/5"
          aria-label="Open rooms and participants"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="line-clamp-1 min-w-0 text-center text-sm font-medium text-slate-100">
          {title}
        </span>
        <div className="flex gap-0.5">
          <Link
            href="/dashboard"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-400 hover:bg-white/5"
            title="Home"
            aria-label="Home"
          >
            <MessageSquare className="h-5 w-5" />
          </Link>
          <button
            type="button"
            onClick={() => {
              setRightOpen((v) => !v);
              setLeftOpen(false);
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-300 hover:bg-white/5"
            aria-label="Open AI copilot"
          >
            <Sparkles className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[14rem_1fr_20rem]">
        <aside
          className={[
            'z-30 min-h-0 min-w-0 border-r border-white/5 lg:col-start-1 lg:row-start-1 lg:block',
            leftOpen
              ? 'fixed inset-0 top-12 z-40 w-[min(20rem,100%)] sm:top-0 lg:static'
              : 'hidden lg:block',
          ].join(' ')}
        >
          {leftOpen && (
            <div
              className="fixed inset-0 top-12 z-20 bg-black/50 lg:hidden"
              aria-hidden
              onClick={() => setLeftOpen(false)}
            />
          )}
          <div
            className={[
              'relative z-30 h-full min-h-0',
              leftOpen && 'h-[calc(100dvh-3rem)]',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <Button
              type="button"
              variant="secondary"
              className="absolute right-2 top-2 z-40 p-1 lg:hidden"
              onClick={() => setLeftOpen(false)}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
            <SessionLeftSidebar
              currentSessionId={sessionId}
              title={title}
              participants={participants}
              onCreateSession={onCreateFromSidebar}
              createBusy={createBusy}
            />
          </div>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-col border-white/5 lg:col-start-2 lg:row-start-1 lg:border-x">
          <div className="hidden shrink-0 border-b border-white/5 bg-[#0c0c0e] px-4 py-2.5 sm:flex sm:items-center sm:justify-between sm:pl-3">
            <div>
              <h1 className="line-clamp-1 text-sm font-semibold text-white sm:text-base">
                {title}
              </h1>
              <p className="line-clamp-1 text-xs text-slate-500">#{sessionId}</p>
            </div>
            <div className="flex items-center gap-2">
              {isHost && (
                <Button variant="danger" type="button" onClick={endSession} disabled={ending} className="text-xs sm:text-sm">
                  {ending ? 'Ending…' : 'End'}
                </Button>
              )}
              <Button variant="secondary" type="button" onClick={() => router.push('/dashboard')}>
                Back
              </Button>
              <Button variant="secondary" type="button" onClick={() => logout()}>
                Sign out
              </Button>
            </div>
          </div>
          {hydrating && (
            <p className="shrink-0 border-b border-amber-900/40 bg-amber-950/30 px-3 py-1.5 text-center text-xs text-amber-100/90">
              Loading room…
            </p>
          )}
          {roomError && (
            <p className="shrink-0 border-b border-amber-900/50 bg-amber-950/40 px-3 py-1.5 text-center text-xs text-amber-200">
              {roomError}
            </p>
          )}
          {error && (
            <p className="shrink-0 border-b border-rose-900/50 bg-rose-950/40 px-3 py-1.5 text-center text-xs text-rose-200">
              {error}
            </p>
          )}
          {!socket && !hydrating && (
            <p className="shrink-0 border-b border-amber-900/40 bg-amber-950/20 px-3 py-1.5 text-center text-xs text-amber-100/90">
              Connecting to live channel…
            </p>
          )}

          <div
            ref={listRef}
            className="min-h-0 flex-1 space-y-1 overflow-y-auto scroll-smooth px-3 py-2 sm:px-4"
          >
            {!hydrating && messages.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-500">
                No messages yet. Say something to start the discussion.
              </p>
            )}
            {messages.map((m) => (
              <SessionMessageRow
                key={m.id || `${m.at}-${m.userId}`}
                msg={m}
                selfId={user?.id}
              />
            ))}
            {showTyping && (
              <div
                className="flex items-center gap-1.5 px-2 py-1 text-sm text-slate-500"
                role="status"
                aria-live="polite"
              >
                <span className="flex gap-0.5" aria-hidden>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500" />
                  <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500"
                    style={{ animationDelay: '0.1s' }}
                  />
                  <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500"
                    style={{ animationDelay: '0.2s' }}
                  />
                </span>
                Someone is typing…
              </div>
            )}
          </div>
          <MessageComposer
            disabled={!socket?.connected || hydrating}
            onSend={sendMessage}
          />
        </main>

        <aside
          className={[
            'z-30 min-h-0 min-w-0 border-l border-white/5 bg-[#0c0c0e] lg:col-start-3',
            rightOpen
              ? 'fixed inset-0 top-12 z-40 w-full sm:top-0 lg:static'
              : 'hidden lg:col-start-3 lg:row-start-1 lg:block',
          ].join(' ')}
        >
          {rightOpen && (
            <div
              className="fixed inset-0 top-12 z-20 bg-black/50 lg:hidden"
              aria-hidden
              onClick={() => setRightOpen(false)}
            />
          )}
          <div
            className={[
              'relative z-30 flex h-full min-h-0 flex-col',
              rightOpen && 'h-[calc(100dvh-3rem)]',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <div className="absolute right-2 top-2 z-40 flex gap-1 lg:hidden">
              <Button
                type="button"
                variant="secondary"
                className="p-1"
                onClick={() => setRightOpen(false)}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="h-full min-h-0">
              <SessionAIPanel sessionTitle={title} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
