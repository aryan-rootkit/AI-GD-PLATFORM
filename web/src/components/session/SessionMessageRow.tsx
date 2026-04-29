import type { ChatPayload } from '@/types/session';
import { isAiMessage } from '@/lib/messages';
import { Bot } from 'lucide-react';

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

export function SessionMessageRow({
  msg,
  selfId,
}: {
  msg: ChatPayload;
  selfId: string | undefined;
}) {
  if (msg.kind === 'system' || msg.type === 'system') {
    const line = bodyText(msg).toLowerCase();
    const isLeave = line.includes('left the session');
    const isJoin = line.includes('joined the session');
    const accent = isLeave
      ? 'border-l-rose-400/80 bg-rose-950/30 text-rose-50/95'
      : isJoin
        ? 'border-l-emerald-400/80 bg-emerald-950/25 text-emerald-50/95'
        : 'border-l-slate-500/60 bg-slate-900/80 text-slate-200';
    return (
      <div className="flex justify-center py-1" role="status" aria-live="polite">
        <p
          className={`max-w-[min(100%,40rem)] rounded-lg border border-white/5 border-l-4 px-3 py-2 text-center text-xs font-medium ${accent}`}
        >
          {bodyText(msg)}
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

  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'} py-0.5`}>
      <div
        className={`max-w-[min(100%,36rem)] rounded-2xl px-3.5 py-2.5 text-sm ${
          mine
            ? 'rounded-br-sm bg-violet-600 text-white'
            : 'rounded-bl-sm border border-slate-600/50 bg-slate-800/90 text-slate-100 ring-1 ring-emerald-500/10'
        }`}
      >
        {!mine && <p className="mb-1 text-xs font-medium text-slate-400">{displayLabel(msg)}</p>}
        {mine && (
          <p className="mb-1 text-right text-xs text-violet-200/90">
            {msg.senderEmail && `You · ${msg.senderEmail.split('@')[0]}`}
            {!msg.senderEmail && 'You'}
          </p>
        )}
        <p className="whitespace-pre-wrap break-words">{bodyText(msg)}</p>
        <p
          className={`mt-1.5 text-[10px] ${mine ? 'text-violet-200' : 'text-slate-500'}`}
        >
          {new Date(msg.timestamp || msg.at).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
