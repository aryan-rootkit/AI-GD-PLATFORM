import type { ChatPayload } from '@/types/session';

function senderLabel(msg: ChatPayload) {
  if (msg.senderEmail) {
    const local = msg.senderEmail.split('@')[0];
    return local || msg.senderEmail;
  }
  return `${msg.userId.slice(0, 8)}…`;
}

export function ChatBubble({
  msg,
  selfId,
}: {
  msg: ChatPayload;
  selfId: string | undefined;
}) {
  const mine = msg.userId === selfId;
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[min(100%,36rem)] rounded-2xl px-4 py-2 text-sm shadow ${
          mine
            ? 'rounded-br-md bg-violet-600 text-white'
            : 'rounded-bl-md border border-slate-700 bg-slate-900 text-slate-100'
        }`}
      >
        {!mine && (
          <p className="mb-1 text-xs font-medium text-violet-300">
            {senderLabel(msg)}
          </p>
        )}
        {mine && msg.senderEmail && (
          <p className="mb-1 text-right text-xs font-medium text-violet-200">
            You · {msg.senderEmail.split('@')[0]}
          </p>
        )}
        <p className="whitespace-pre-wrap break-words">{msg.text}</p>
        <p className={`mt-1 text-[10px] ${mine ? 'text-violet-200' : 'text-slate-500'}`}>
          {new Date(msg.at).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
