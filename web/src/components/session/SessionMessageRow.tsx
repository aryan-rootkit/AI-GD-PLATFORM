import type { ChatPayload } from '@/types/session';
import { isAiMessage } from '@/lib/messages';
import { Bot } from 'lucide-react';

function displayLabel(msg: ChatPayload) {
  if (msg.senderEmail) {
    if (isAiMessage(msg)) return 'AI Moderator';
    const at = msg.senderEmail.split('@')[0];
    return at || msg.senderEmail;
  }
  return `${msg.userId.slice(0, 6)}…`;
}

export function SessionMessageRow({
  msg,
  selfId,
}: {
  msg: ChatPayload;
  selfId: string | undefined;
}) {
  const mine = !isAiMessage(msg) && msg.userId === selfId;
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
            {msg.text}
          </p>
          <p className="mt-1.5 text-[10px] text-violet-200/50">
            {new Date(msg.at).toLocaleTimeString()}
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
            : 'rounded-bl-sm border border-slate-600/50 bg-slate-800/90 text-slate-100'
        }`}
      >
        {!mine && <p className="mb-1 text-xs font-medium text-slate-400">{displayLabel(msg)}</p>}
        {mine && (
          <p className="mb-1 text-right text-xs text-violet-200/90">
            {msg.senderEmail && `You · ${msg.senderEmail.split('@')[0]}`}
            {!msg.senderEmail && 'You'}
          </p>
        )}
        <p className="whitespace-pre-wrap break-words">{msg.text}</p>
        <p
          className={`mt-1.5 text-[10px] ${mine ? 'text-violet-200' : 'text-slate-500'}`}
        >
          {new Date(msg.at).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
