import { Container } from './Container';

const messages = [
  {
    id: '1',
    label: 'Alex',
    isAi: false,
    text: 'I think we should weight user research higher before the technical spike.',
  },
  {
    id: '2',
    label: 'Maya',
    isAi: false,
    text: "Agree—but we also need a thin slice in prod to learn from real traffic.",
  },
  {
    id: '3',
    label: 'AI Moderator',
    isAi: true,
    text:
      'Great tension to explore: how might you time-box research vs. a smaller ship to production?',
  },
  {
    id: '4',
    label: 'Jordan',
    isAi: false,
    text: "Two weeks discovery, one-week slice—if we define success metrics upfront.",
  },
] as const;

export function ChatPreviewSection() {
  return (
    <section
      className="border-t border-b border-white/5 bg-gradient-to-b from-slate-950 to-slate-900/50 py-20 sm:py-24"
      aria-labelledby="chat-preview-heading"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <h2
              id="chat-preview-heading"
              className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
            >
              Live interaction preview
            </h2>
            <p className="mt-3 text-slate-400 sm:text-lg">
              Everyone sees the same room: human voices plus an always-on moderator that
              sharpens the discussion without taking it over.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-slate-500">
              <li className="flex gap-2">
                <span className="text-violet-400" aria-hidden>
                  —
                </span>
                Distinct styles for people vs. AI so the thread stays scannable
              </li>
              <li className="flex gap-2">
                <span className="text-violet-400" aria-hidden>
                  —
                </span>
                Real-time order preserved—mock only, no data leaves this page
              </li>
            </ul>
          </div>

          <div
            className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 shadow-2xl ring-1 ring-white/5"
            role="img"
            aria-label="Mock chat: sample messages"
          >
            <div className="flex items-center justify-between border-b border-white/5 bg-slate-900/80 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px] shadow-emerald-500/50" />
                <span className="text-sm font-medium text-slate-200">Room: Strategy sync</span>
              </div>
              <span className="text-xs text-slate-500">3 participants · Live</span>
            </div>
            <div className="max-h-80 space-y-3 overflow-y-auto p-4 sm:max-h-96 sm:p-5">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.isAi
                      ? 'border border-violet-500/30 bg-violet-500/[0.07] text-slate-100'
                      : 'max-w-md border border-white/5 bg-slate-800/50 text-slate-200'
                  } `}
                >
                  <p className="text-xs font-medium text-slate-500">
                    {m.isAi ? (
                      <span className="text-violet-300">{m.label}</span>
                    ) : (
                      <span className="text-slate-400">{m.label}</span>
                    )}
                  </p>
                  <p className="mt-0.5 text-slate-200/95">{m.text}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-white/5 bg-slate-900/50 px-4 py-3">
              <div className="flex gap-2 rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-slate-500">
                <span className="flex-1">Message (preview only)…</span>
                <span className="rounded bg-slate-800/80 px-2 py-0.5 text-xs">Send</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
