import type { ChatPayload } from '@/types/session';
import { isAiMessage } from '@/lib/messages';
import { Bot, LogIn, LogOut, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';

function bodyText(msg: ChatPayload) {
  return (msg.text || msg.content || '').trim();
}

function selfIdMatch(msg: ChatPayload, selfId: string | undefined) {
  if (!selfId) return false;
  return msg.userId === selfId || msg.senderId === selfId;
}

function displayLabel(msg: ChatPayload) {
  const name = (msg.senderName || msg.senderEmail || '').trim();
  if (name) {
    if (isAiMessage(msg)) return 'AI Moderator';
    if (name.includes('@')) {
      const at = name.split('@')[0];
      return at || name;
    }
    return name;
  }
  const sid = msg.senderId || msg.userId || '';
  if (!sid) return 'Unknown';
  return `${sid.slice(0, 6)}…`;
}

type RowProps = {
  msg: ChatPayload;
  selfId: string | undefined;
  socketReady?: boolean;
  onToggleKeyPoint?: (messageId: string, next: boolean) => void;
  onReact?: (messageId: string, kind: 'agree' | 'disagree') => void;
};

export function SessionMessageRow({
  msg,
  selfId,
  socketReady = false,
  onToggleKeyPoint,
  onReact,
}: RowProps) {
  if (msg.kind === 'system' || msg.type === 'system') {
    const line = bodyText(msg).toLowerCase();
    const isLeave = line.includes('left the session');
    const isJoin = line.includes('joined the session');
    const accent = isLeave
      ? 'border-l-rose-400/90 bg-gradient-to-r from-rose-950/40 to-rose-950/10 text-rose-50/95 ring-rose-500/20 animate-system-glow-leave'
      : isJoin
        ? 'border-l-emerald-400/90 bg-gradient-to-r from-emerald-950/40 to-emerald-950/10 text-emerald-50/95 ring-emerald-500/20 animate-system-glow-join'
        : 'border-l-slate-400/70 bg-slate-900/85 text-slate-200';
    const Icon = isLeave ? LogOut : isJoin ? LogIn : null;
    return (
      <div className="flex justify-center py-1.5" role="status" aria-live="polite">
        <p
          className={`flex max-w-[min(100%,40rem)] items-center justify-center gap-2 rounded-xl border border-white/5 border-l-[3px] px-3 py-2.5 text-center text-xs font-medium shadow-sm ring-1 ring-inset animate-system-banner ${accent}`}
        >
          {Icon ? <Icon className="h-3.5 w-3.5 shrink-0 opacity-90" strokeWidth={2.5} aria-hidden /> : null}
          <span>{bodyText(msg)}</span>
        </p>
      </div>
    );
  }

  const mine = !isAiMessage(msg) && selfIdMatch(msg, selfId);
  const ai = isAiMessage(msg);

  if (ai) {
    return (
      <div className="flex justify-center py-0.5">
        <div className="max-w-[min(100%,40rem)] rounded-2xl border border-violet-500/30 bg-violet-950/30 px-4 py-2.5 shadow-lg shadow-violet-950/20">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/40 bg-violet-500/20 px-2.5 py-0.5 text-xs font-semibold text-violet-200">
              <Bot className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
              AI
            </span>
            <span className="text-xs text-violet-200/80">{displayLabel(msg)}</span>
          </div>
          <p className="text-sm leading-relaxed text-slate-100 whitespace-pre-wrap break-words">
            {bodyText(msg)}
          </p>
          <p className="mt-1.5 text-[10px] text-violet-200/50">
            {new Date(msg.timestamp || msg.at).toLocaleTimeString()}
          </p>
        </div>
      </div>
    );
  }

  const mid = msg.id;
  const keyPoint = Boolean(msg.isKeyPoint);
  const reactions = msg.reactions ?? { agree: 0, disagree: 0 };
  const showKey = Boolean(mid && socketReady && onToggleKeyPoint);
  const showReact = Boolean(mid && socketReady && onReact);

  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'} py-0.5`}>
      <div
        className={`max-w-[min(100%,36rem)] rounded-2xl px-3.5 py-2.5 text-sm transition-shadow ${
          keyPoint
            ? mine
              ? 'rounded-br-sm bg-violet-700 ring-2 ring-amber-400/70 shadow-md shadow-amber-900/20'
              : 'rounded-bl-sm border border-amber-500/40 bg-slate-800/95 ring-2 ring-amber-400/50 shadow-md shadow-amber-900/15'
            : mine
              ? 'rounded-br-sm bg-violet-600 text-white'
              : 'rounded-bl-sm border border-slate-600/50 bg-slate-800/90 text-slate-100 ring-1 ring-emerald-500/10'
        }`}
      >
        {keyPoint && (
          <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-amber-200/95">
            <Star className="h-3 w-3 fill-amber-300/90 text-amber-200" strokeWidth={2} aria-hidden />
            Key point
          </p>
        )}
        {!mine && <p className="mb-1 text-xs font-medium text-slate-400">{displayLabel(msg)}</p>}
        {mine && (
          <p className="mb-1 text-right text-xs text-violet-200/90">
            {msg.senderEmail && `You · ${msg.senderEmail.split('@')[0]}`}
            {!msg.senderEmail && 'You'}
          </p>
        )}
        <p className="whitespace-pre-wrap break-words">{bodyText(msg)}</p>
        <p className={`mt-1.5 text-[10px] ${mine ? 'text-violet-200' : 'text-slate-500'}`}>
          {new Date(msg.timestamp || msg.at).toLocaleTimeString()}
        </p>
        {(showKey || showReact) && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-white/10 pt-2">
            {showKey ? (
              <Button
                type="button"
                variant="secondary"
                className="px-2 py-1 text-[10px] font-medium"
                disabled={!socketReady}
                onClick={() => mid && onToggleKeyPoint?.(mid, !keyPoint)}
              >
                {keyPoint ? 'Unmark key point' : 'Mark as key point'}
              </Button>
            ) : null}
            {showReact ? (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  className="px-2 py-1 text-[10px] font-medium"
                  disabled={!socketReady}
                  onClick={() => mid && onReact?.(mid, 'agree')}
                >
                  Agree{reactions.agree > 0 ? ` · ${reactions.agree}` : ''}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="px-2 py-1 text-[10px] font-medium"
                  disabled={!socketReady}
                  onClick={() => mid && onReact?.(mid, 'disagree')}
                >
                  Disagree{reactions.disagree > 0 ? ` · ${reactions.disagree}` : ''}
                </Button>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
