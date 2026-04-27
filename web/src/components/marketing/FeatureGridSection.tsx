import {
  FileText,
  MessagesSquare,
  GitBranch,
  BarChart2,
  History,
  FileDown,
} from 'lucide-react';
import { MContainer } from './Container';

const features = [
  {
    icon: FileText,
    title: 'AI live session summarization',
    text: 'Capture the arc of a conversation in seconds—not hours of replay.',
  },
  {
    icon: MessagesSquare,
    title: 'Real-time group chat collaboration',
    text: 'Low-latency rooms with everyone aligned on a single thread.',
  },
  {
    icon: GitBranch,
    title: 'Decision tracking',
    text: 'Surface commitments and trade-offs as the discussion happens.',
  },
  {
    icon: BarChart2,
    title: 'AI insights & reports',
    text: 'Lightweight takeaways and participation signals to improve next time.',
  },
  {
    icon: History,
    title: 'Session replay & history',
    text: 'Revisit the conversation when you need detail or accountability.',
  },
  {
    icon: FileDown,
    title: 'Exportable notes',
    text: 'Move outcomes into docs, wikis, and shareouts without copy-paste chaos.',
  },
] as const;

export function FeatureGridSection() {
  return (
    <section
      id="features"
      className="border-b border-white/5 py-16 sm:py-24"
      aria-labelledby="features-grid-heading"
    >
      <MContainer>
        <h2
          id="features-grid-heading"
          className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          Everything you need for better discussions
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-400 sm:text-lg">
          Purpose-built for workshops, team debates, and any session where ideas need to stick.
        </p>
        <ul className="mt-10 grid list-none grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const I = f.icon;
            return (
              <li
                key={f.title}
                className="rounded-2xl border border-white/[0.07] bg-slate-900/30 p-6 transition duration-200 hover:border-violet-500/20 hover:bg-slate-900/50"
              >
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10 text-violet-200">
                  <I className="h-5 w-5" strokeWidth={1.6} />
                </div>
                <h3 className="text-lg font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.text}</p>
              </li>
            );
          })}
        </ul>
      </MContainer>
    </section>
  );
}
