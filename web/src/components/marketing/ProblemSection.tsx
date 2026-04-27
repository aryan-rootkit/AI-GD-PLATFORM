import { CircleSlash, XCircle, MessageSquareX, UserX } from 'lucide-react';
import { MContainer } from './Container';

const points = [
  { icon: CircleSlash, text: 'No structured outcomes' },
  { icon: XCircle, text: 'Hard to track decisions' },
  { icon: MessageSquareX, text: 'Lost ideas in conversations' },
  { icon: UserX, text: 'No AI assistance' },
] as const;

export function ProblemSection() {
  return (
    <section
      className="border-b border-white/5 py-16 sm:py-20"
      aria-labelledby="problem-heading"
    >
      <MContainer>
        <h2
          id="problem-heading"
          className="mx-auto max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          Traditional group discussions are broken
        </h2>
        <ul className="mt-10 grid max-w-3xl gap-4 sm:grid-cols-2 sm:gap-5">
          {points.map(({ icon: I, text }) => (
            <li
              key={text}
              className="flex items-start gap-3 rounded-2xl border border-white/5 bg-slate-900/30 px-4 py-3.5 text-slate-300"
            >
              <I className="mt-0.5 h-5 w-5 shrink-0 text-rose-400/80" strokeWidth={1.75} aria-hidden />
              <span className="text-sm leading-relaxed sm:text-base">{text}</span>
            </li>
          ))}
        </ul>
      </MContainer>
    </section>
  );
}
