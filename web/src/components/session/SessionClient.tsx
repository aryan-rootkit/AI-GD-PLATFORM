'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MessageComposer } from '@/components/chat/MessageComposer';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { isAiMessage } from '@/lib/messages';
import { SessionAIPanel } from '@/components/session/SessionAIPanel';
import { SessionLeftSidebar } from '@/components/session/SessionLeftSidebar';
import { SessionTopBar } from '@/components/session/SessionTopBar';
import { SessionMessageRow } from '@/components/session/SessionMessageRow';
import type { ChatPayload, Session } from '@/types/session';
import { FlashNotice } from '@/components/ui/FlashNotice';
import { consumeSessionFlash, setSessionFlash } from '@/utils/sessionFlash';

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
  const [isSessionMinimized, setIsSessionMinimized] = useState(false);
  const [welcomeNotice, setWelcomeNotice] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const minimizeSession = useCallback(() => {
    setIsSessionMinimized(true);
    setLeftOpen(false);
    setRightOpen(false);
  }, []);

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
        if (!cancelled) {
          if (typeof window !== 'undefined') sessionStorage.removeItem('roomMeta');
          router.replace('/dashboard');
        }
      } finally {
        if (!cancelled) setHydrating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId, router]);

  useEffect(() => {
    if (hydrating) return;
    const flash = consumeSessionFlash();
    if (!flash) return;
    const copy: Record<string, string> = {
      created: 'Session created — you’re in the room.',
      joined: 'Joined session successfully.',
      practice: 'Practice room ready. Mock AI participants are listed in the sidebar.',
    };
    const msg = copy[flash.kind];
    if (msg) setWelcomeNotice(msg);
  }, [hydrating]);

  const emitJoin = useCallback(() => {
    if (!socket?.connected || !sessionId) return;
    const displayName =
      (user?.name && user.name.trim()) ||
      (user?.email ? user.email.split('@')[0] : '') ||
      'Member';
    socket.emit('join_room', { sessionId, displayName });
  }, [socket, sessionId, user?.name, user?.email]);

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

    const onUserJoined = (payload: { userId: string; name: string }) => {
      const name = (payload.name || 'Someone').trim() || 'Someone';
      const line = `${name} joined the session`;
      setMessages((prev) => {
        const id =
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `sys:join:${payload.userId}:${Date.now()}`;
        if (prev.some((p) => p.id === id)) return prev;
        return [
          ...prev,
          {
            id,
            sessionId,
            userId: '__system__',
            kind: 'system' as const,
            text: line,
            at: new Date().toISOString(),
          },
        ];
      });
    };

    const onUserLeft = (payload: { userId: string; name: string }) => {
      const name = (payload.name || 'Someone').trim() || 'Someone';
      const line = `${name} left the session`;
      setMessages((prev) => {
        const id =
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `sys:left:${payload.userId}:${Date.now()}`;
        if (prev.some((p) => p.id === id)) return prev;
        return [
          ...prev,
          {
            id,
            sessionId,
            userId: '__system__',
            kind: 'system' as const,
            text: line,
            at: new Date().toISOString(),
          },
        ];
      });
    };

    socket.on('receive_message', onReceive);
    socket.on('room_error', onRoomError);
    socket.on('user_joined', onUserJoined);
    socket.on('user_left', onUserLeft);
    return () => {
      socket.off('connect', emitJoin);
      socket.off('receive_message', onReceive);
      socket.off('room_error', onRoomError);
      socket.off('user_joined', onUserJoined);
      socket.off('user_left', onUserLeft);
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

  const topicSubtitle = useMemo(() => {
    const kind = session?.topicKind;
    if (!kind) return null;
    if (kind === 'auto') return 'Topic · Auto-assigned';
    if (kind === 'custom') {
      const d = session.topicDetail?.trim();
      return d ? `Topic · ${d}` : 'Topic · Custom';
    }
    const labels: Record<string, string> = {
      business: 'Business',
      technology: 'Technology',
      abstract: 'Abstract',
    };
    return `Topic · ${labels[kind] ?? kind}`;
  }, [session?.topicKind, session?.topicDetail]);

  const participants = useMemo(() => {
    const raw = session?.participants;
    const practiceBots =
      session?.isPractice && Array.isArray(session.practiceParticipants)
        ? session.practiceParticipants.map((p) => ({
            id: p.id,
            isSelf: false,
            online: true,
            label: p.displayName,
          }))
        : [];

    if (!raw || raw.length === 0) {
      if (user?.id) {
        const selfRow = {
          id: user.id,
          isSelf: true,
          online: true,
          label: user.name || user.email?.split('@')[0] || 'You',
        };
        return practiceBots.length ? [selfRow, ...practiceBots] : [selfRow];
      }
      return practiceBots;
    }
    const realRows = raw.map((id) => ({
      id,
      isSelf: id === user?.id,
      online: true,
      label:
        id === user?.id
          ? user.name || user.email?.split('@')[0] || 'You'
          : `Member ${id.slice(0, 6)}…`,
    }));
    return [...realRows, ...practiceBots];
  }, [session?.participants, session?.isPractice, session?.practiceParticipants, user]);

  const participantCount = participants.length;

  const endSession = async () => {
    if (!isHost) return;
    setEnding(true);
    setError(null);
    try {
      await api.post(`/api/session/end/${sessionId}`);
      setSessionFlash({ kind: 'ended' });
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
          setSessionFlash({ kind: 'created' });
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
    <>
    <div
      className={`flex h-[100dvh] max-h-[100dvh] min-h-0 w-full flex-col overflow-hidden bg-[#0a0a0b] text-slate-200 ${
        isSessionMinimized ? 'hidden' : ''
      }`}
      aria-hidden={isSessionMinimized}
    >
      <SessionTopBar
        title={title}
        sessionId={sessionId}
        participantCount={participantCount}
        topicSubtitle={topicSubtitle}
        isHost={isHost}
        ending={ending}
        onOpenParticipants={() => {
          setLeftOpen(true);
          setRightOpen(false);
        }}
        onOpenAi={() => {
          setRightOpen(true);
          setLeftOpen(false);
        }}
        onMinimize={minimizeSession}
        onLogout={logout}
        onEndSession={endSession}
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-1 lg:grid-cols-[15rem_minmax(0,1fr)_18rem]">
        <aside
          className={[
            'z-30 min-h-0 min-w-0 border-r border-white/5 lg:col-start-1 lg:row-start-1 lg:block',
            leftOpen
              ? 'fixed inset-0 z-40 w-[min(18rem,100%)] lg:static'
              : 'hidden lg:block',
          ].join(' ')}
        >
          {leftOpen && (
            <div
              className="fixed inset-0 z-20 bg-black/50 lg:hidden"
              aria-hidden
              onClick={() => setLeftOpen(false)}
            />
          )}
          <div
            className={[
              'relative z-30 flex h-full min-h-0 flex-col',
              leftOpen && 'h-[100dvh] lg:h-full',
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
              participants={participants}
              participantCount={participantCount}
              onCreateSession={onCreateFromSidebar}
              createBusy={createBusy}
              createSessionDisabledReason="You are already in a session"
            />
          </div>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-col border-white/5 lg:col-start-2 lg:row-start-1 lg:border-x">
          {hydrating && (
            <p className="shrink-0 border-b border-amber-900/40 bg-amber-950/30 px-3 py-2 text-center text-xs text-amber-100/90">
              Loading room and messages…
            </p>
          )}
          {welcomeNotice && !hydrating && (
            <div className="shrink-0 border-b border-emerald-900/30 px-3 py-2 sm:px-4">
              <FlashNotice message={welcomeNotice} onDismiss={() => setWelcomeNotice(null)} />
            </div>
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
            className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden scroll-smooth px-3 py-2 sm:px-4"
          >
            {!hydrating && messages.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-10 px-4 text-center">
                <p className="text-sm font-medium text-slate-400">No messages yet</p>
                <p className="max-w-sm text-xs leading-relaxed text-slate-500">
                  Say hello, state your position, or ask a question—your opening helps set the tone for everyone.
                </p>
              </div>
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
          <div className="shrink-0 border-t border-white/5 bg-[#0a0a0b]/95 backdrop-blur-sm">
            <MessageComposer disabled={!socket?.connected || hydrating} onSend={sendMessage} />
          </div>
        </main>

        <aside
          className={[
            'z-30 min-h-0 min-w-0 border-l border-white/5 bg-[#0c0c0e] lg:col-start-3',
            rightOpen
              ? 'fixed inset-0 z-40 w-full lg:static'
              : 'hidden lg:col-start-3 lg:row-start-1 lg:block',
          ].join(' ')}
        >
          {rightOpen && (
            <div
              className="fixed inset-0 z-20 bg-black/50 lg:hidden"
              aria-hidden
              onClick={() => setRightOpen(false)}
            />
          )}
          <div
            className={[
              'relative z-30 flex h-full min-h-0 flex-col',
              rightOpen && 'h-[100dvh] lg:h-full',
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

    {isSessionMinimized && (
      <div
        className="fixed inset-x-0 bottom-0 z-[100] flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2"
        role="status"
        aria-live="polite"
      >
        <button
          type="button"
          onClick={() => setIsSessionMinimized(false)}
          className="w-full max-w-md rounded-2xl border border-violet-500/40 bg-slate-900/95 px-5 py-3.5 text-center text-sm font-medium text-violet-100 shadow-lg shadow-black/40 backdrop-blur-sm transition hover:border-violet-400/60 hover:bg-slate-900"
        >
          Session active – Tap to return
        </button>
      </div>
    )}
    </>
  );
}
