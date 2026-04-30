'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MessageComposer, type ComposerPrefill } from '@/components/chat/MessageComposer';
import { DISCUSSION_TEMPLATES } from '@/lib/discussionTemplates';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { isAiMessage } from '@/lib/messages';
import { SessionAIPanel } from '@/components/session/SessionAIPanel';
import { SessionLeftSidebar, type SidebarParticipant } from '@/components/session/SessionLeftSidebar';
import {
  formatPeerTypingLine,
  getLastHumanMessageMeta,
  isRecentSpeaker,
} from '@/lib/sessionActivity';
import { computeDiscussionIntensity } from '@/lib/discussionIntensity';
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
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  /** Large screens: moderator column visible (chat gets remaining width). */
  const [aiPanelDesktopVisible, setAiPanelDesktopVisible] = useState(true);
  const [endSessionConfirmOpen, setEndSessionConfirmOpen] = useState(false);
  const [lgUp, setLgUp] = useState(false);
  const [isSessionMinimized, setIsSessionMinimized] = useState(false);
  const [welcomeNotice, setWelcomeNotice] = useState<string | null>(null);
  const [composerPrefill, setComposerPrefill] = useState<ComposerPrefill | null>(null);
  const [peerTyping, setPeerTyping] = useState<Record<string, string>>({});
  /** Live participant user IDs (socket join/leave); seeded from session. */
  const [presenceIds, setPresenceIds] = useState<string[]>([]);
  const [peerLabels, setPeerLabels] = useState<Record<string, string>>({});
  /** Bumps every 30s so “Live • N min” stays fresh. */
  const [nowTick, setNowTick] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const typingClearTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const lastTypingEmitRef = useRef(0);

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
    if (!session) return;
    const ids = [...(session.participants || [])];
    if (user?.id && !ids.includes(user.id)) ids.push(user.id);
    setPresenceIds(ids);
  }, [session?.id, session?.participants, user?.id]);

  useEffect(() => {
    if (hydrating) return;
    const flash = consumeSessionFlash();
    if (!flash) return;
    const copy: Record<string, string> = {
      created: 'Session created — you’re in the room.',
      joined: 'Joined session successfully.',
      practice:
        'Practice room ready. Two or three simulated participants (AI_1, AI_2, …) appear in the sidebar—no real sockets.',
    };
    const msg = copy[flash.kind];
    if (msg) setWelcomeNotice(msg);
  }, [hydrating]);

  useEffect(() => {
    const id = window.setInterval(() => setNowTick((n) => n + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const go = () => setLgUp(mq.matches);
    go();
    mq.addEventListener('change', go);
    return () => mq.removeEventListener('change', go);
  }, []);

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

    const timers = typingClearTimers.current;
    const onParticipantTyping = (p: { userId: string; displayName: string }) => {
      if (!user?.id || p.userId === user.id) return;
      setPeerTyping((prev) => ({ ...prev, [p.userId]: p.displayName }));
      const existing = timers.get(p.userId);
      if (existing) clearTimeout(existing);
      const t = setTimeout(() => {
        setPeerTyping((prev) => {
          const next = { ...prev };
          delete next[p.userId];
          return next;
        });
        timers.delete(p.userId);
      }, 2800);
      timers.set(p.userId, t);
    };

    const onUserJoined = (p: { userId: string; name: string }) => {
      if (!p?.userId) return;
      setPresenceIds((prev) => (prev.includes(p.userId) ? prev : [...prev, p.userId]));
      if (p.name) setPeerLabels((prev) => ({ ...prev, [p.userId]: p.name }));
    };

    const onUserLeft = (p: { userId: string }) => {
      if (!p?.userId) return;
      setPresenceIds((prev) => prev.filter((id) => id !== p.userId));
    };

    const onMessagePatch = (patch: {
      messageId: string;
      isKeyPoint?: boolean;
      reactions?: { agree: number; disagree: number };
    }) => {
      if (!patch?.messageId) return;
      setMessages((prev) =>
        prev.map((m) => {
          const id = m.id ?? '';
          if (!id || id !== patch.messageId) return m;
          return {
            ...m,
            ...(patch.isKeyPoint !== undefined ? { isKeyPoint: patch.isKeyPoint } : {}),
            ...(patch.reactions ? { reactions: patch.reactions } : {}),
          };
        }),
      );
    };

    socket.on('receive_message', onReceive);
    socket.on('room_error', onRoomError);
    socket.on('participant_typing', onParticipantTyping);
    socket.on('user_joined', onUserJoined);
    socket.on('user_left', onUserLeft);
    socket.on('message_patch', onMessagePatch);
    return () => {
      socket.off('connect', emitJoin);
      socket.off('receive_message', onReceive);
      socket.off('room_error', onRoomError);
      socket.off('participant_typing', onParticipantTyping);
      socket.off('user_joined', onUserJoined);
      socket.off('user_left', onUserLeft);
      socket.off('message_patch', onMessagePatch);
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, [socket, sessionId, emitJoin, user?.id]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, peerTyping]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!socket?.connected) {
        setError('Not connected—wait for socket or refresh.');
        return;
      }
      setError(null);
      setRoomError(null);
      socket.emit('send_message', { sessionId, text });
    },
    [socket, sessionId],
  );

  const title = session?.title || 'Session';
  const isHost = Boolean(user?.id && session?.hostId && session.hostId === user.id);

  const topicSubtitle = useMemo(() => {
    const headline = session?.topic?.trim();
    if (headline) return `Topic · ${headline}`;
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
  }, [session?.topic, session?.topicKind, session?.topicDetail]);

  /** Plain-language topic for empty-state heading (no "Topic ·" prefix). */
  const discussionTopicLabel = useMemo(() => {
    const headline = session?.topic?.trim();
    if (headline) return headline;
    const kind = session?.topicKind;
    if (!kind || kind === 'auto') return 'Open discussion';
    if (kind === 'custom') {
      const d = session.topicDetail?.trim();
      return d || 'Custom topic';
    }
    const labels: Record<string, string> = {
      business: 'Business',
      technology: 'Technology',
      abstract: 'Abstract',
    };
    const L = labels[kind];
    const d = session?.topicDetail?.trim();
    if (L && d) return `${L} · ${d}`;
    return L || kind;
  }, [session?.topic, session?.topicKind, session?.topicDetail]);

  const prefillComposer = useCallback((template: string) => {
    setComposerPrefill({ id: Date.now(), text: template });
  }, []);

  const emitTypingThrottled = useCallback(() => {
    if (!socket?.connected || !sessionId) return;
    const t = Date.now();
    if (t - lastTypingEmitRef.current < 1000) return;
    lastTypingEmitRef.current = t;
    socket.emit('typing', { sessionId });
  }, [socket, sessionId]);

  const sessionStatusLine = useMemo(() => {
    if (!session?.createdAt) return null;
    if (session.status !== 'active') return 'Ended';
    const start = new Date(session.createdAt).getTime();
    const mins = Math.max(0, Math.floor((Date.now() - start) / 60_000));
    return `Live • ${mins} min`;
  }, [session?.createdAt, session?.status, nowTick]);

  const typingLine = useMemo(() => formatPeerTypingLine(peerTyping), [peerTyping]);

  const discussionIntensity = useMemo(() => {
    if (!session || session.status !== 'active') return null;
    return computeDiscussionIntensity(messages, Date.now());
  }, [session, messages, nowTick]);

  const effectiveParticipantIds = useMemo(() => {
    if (presenceIds.length > 0) return presenceIds;
    if (session?.participants?.length) return [...session.participants];
    if (user?.id) return [user.id];
    return [];
  }, [presenceIds, session?.participants, user?.id]);

  const participants = useMemo(() => {
    const raw = effectiveParticipantIds;
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
          : peerLabels[id] || `Member ${id.slice(0, 6)}…`,
    }));
    return [...realRows, ...practiceBots];
  }, [
    effectiveParticipantIds,
    session?.isPractice,
    session?.practiceParticipants,
    user,
    peerLabels,
  ]);

  const participantsWithActivity = useMemo((): SidebarParticipant[] => {
    const now = Date.now();
    const lastMeta = getLastHumanMessageMeta(messages);
    return participants.map((p) => {
      const typing = Boolean(peerTyping[p.id]);
      const recent = isRecentSpeaker(lastMeta, p.id, now);
      const activity: 'active' | 'silent' = typing || recent ? 'active' : 'silent';
      return {
        id: p.id,
        label: p.label,
        isSelf: p.isSelf,
        online: p.online,
        activity,
      };
    });
  }, [participants, messages, peerTyping, nowTick]);

  const participantCount = participantsWithActivity.length;

  const performEndSession = async () => {
    if (!isHost) return;
    setEndSessionConfirmOpen(false);
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

  const moderatorExpanded = lgUp ? aiPanelDesktopVisible : rightOpen;

  const handleModeratorToggle = useCallback(() => {
    setLeftOpen(false);
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(min-width: 1024px)').matches) {
      setAiPanelDesktopVisible((v) => !v);
    } else {
      setRightOpen((v) => !v);
    }
  }, []);

  const toggleKeyPoint = useCallback(
    (messageId: string, next: boolean) => {
      if (!socket?.connected) return;
      socket.emit('mark_key_point', { sessionId, messageId, value: next });
    },
    [socket, sessionId],
  );

  const sendReaction = useCallback(
    (messageId: string, kind: 'agree' | 'disagree') => {
      if (!socket?.connected) return;
      socket.emit('message_reaction', { sessionId, messageId, kind });
    },
    [socket, sessionId],
  );

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
        sessionStatusLine={sessionStatusLine}
        sessionFooterNote="You will receive AI feedback after session ends."
        discussionIntensity={discussionIntensity}
        isHost={isHost}
        ending={ending}
        moderatorPanelExpanded={moderatorExpanded}
        onOpenParticipants={() => {
          setLeftOpen(true);
          setRightOpen(false);
        }}
        onToggleModerator={handleModeratorToggle}
        onMinimize={minimizeSession}
        onLogout={logout}
        onRequestEndSession={() => setEndSessionConfirmOpen(true)}
      />

      <div
        className={[
          'grid min-h-0 flex-1 grid-cols-1 grid-rows-1',
          aiPanelDesktopVisible
            ? 'lg:grid-cols-[14rem_minmax(0,1fr)_minmax(13rem,15rem)]'
            : 'lg:grid-cols-[14rem_minmax(0,1fr)]',
        ].join(' ')}
      >
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
              participants={participantsWithActivity}
              participantCount={participantCount}
              isInActiveSession
              typingHint={typingLine}
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
              <div className="flex flex-col items-center gap-4 py-10 px-4 text-center">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-violet-400/90">Session topic</p>
                  <p className="max-w-md text-base font-medium leading-snug text-slate-100">{discussionTopicLabel}</p>
                  <p className="max-w-md text-sm leading-relaxed text-slate-400">
                    Start the discussion by sharing your first point.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="text-xs sm:text-sm"
                    disabled={!socket?.connected || hydrating}
                    onClick={() => prefillComposer(DISCUSSION_TEMPLATES.raisePoint)}
                  >
                    Raise a point
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="text-xs sm:text-sm"
                    disabled={!socket?.connected || hydrating}
                    onClick={() => prefillComposer(DISCUSSION_TEMPLATES.agree)}
                  >
                    Agree
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="text-xs sm:text-sm"
                    disabled={!socket?.connected || hydrating}
                    onClick={() => prefillComposer(DISCUSSION_TEMPLATES.disagree)}
                  >
                    Disagree
                  </Button>
                </div>
              </div>
            )}
            {messages.map((m) => (
              <SessionMessageRow
                key={m.id || `${m.at}-${m.senderId || m.userId}-${m.text || m.content || ''}`}
                msg={m}
                selfId={user?.id}
                socketReady={Boolean(socket?.connected)}
                onToggleKeyPoint={toggleKeyPoint}
                onReact={sendReaction}
              />
            ))}
            {typingLine ? (
              <div
                className="flex items-center gap-1.5 px-2 py-1 text-sm text-violet-300/90"
                role="status"
                aria-live="polite"
              >
                <span className="flex gap-0.5" aria-hidden>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400/90" />
                  <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400/90"
                    style={{ animationDelay: '0.1s' }}
                  />
                  <span
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400/90"
                    style={{ animationDelay: '0.2s' }}
                  />
                </span>
                {typingLine}
              </div>
            ) : null}
          </div>
          <div className="shrink-0 border-t border-white/5 bg-[#0a0a0b]/95 backdrop-blur-sm">
            <MessageComposer
              disabled={!socket?.connected || hydrating}
              onSend={sendMessage}
              prefill={composerPrefill}
              onTypingActivity={emitTypingThrottled}
            />
          </div>
        </main>

        <aside
          className={[
            'z-30 min-h-0 min-w-0 border-l border-white/5 bg-[#0c0c0e]',
            rightOpen
              ? 'fixed inset-0 z-40 w-full lg:static lg:col-start-3 lg:row-start-1 lg:h-full lg:max-w-[15rem]'
              : '',
            !rightOpen && aiPanelDesktopVisible
              ? 'hidden lg:col-start-3 lg:row-start-1 lg:block lg:h-full lg:max-w-[15rem]'
              : '',
            !rightOpen && !aiPanelDesktopVisible ? 'hidden' : '',
          ]
            .filter(Boolean)
            .join(' ')}
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

    {endSessionConfirmOpen && (
      <div
        className="fixed inset-0 z-[80] flex items-end justify-center bg-black/65 p-4 sm:items-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="end-session-confirm-title"
      >
        <button
          type="button"
          className="absolute inset-0 cursor-default"
          aria-label="Dismiss"
          disabled={ending}
          onClick={() => {
            if (!ending) setEndSessionConfirmOpen(false);
          }}
        />
        <div className="relative z-10 w-full max-w-md rounded-xl border border-white/10 bg-[#141416] p-5 shadow-2xl shadow-black/50">
          <h2 id="end-session-confirm-title" className="text-base font-semibold text-white">
            End session?
          </h2>
          <p className="mt-2 text-sm text-slate-400">Are you sure you want to end session?</p>
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={ending}
              onClick={() => setEndSessionConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={ending}
              onClick={() => void performEndSession()}
            >
              {ending ? 'Ending…' : 'Confirm'}
            </Button>
          </div>
        </div>
      </div>
    )}

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
