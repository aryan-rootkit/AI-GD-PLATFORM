import { Clapperboard, MessageCircle, Sparkles } from 'lucide-react';
import { MContainer } from './Container';

const steps = [
  {
    num: 1,
    title: 'Create or join a live session',
    text: 'Name your room, invite the group, and step in with one link.',
    icon: Clapperboard,
  },
  {
    num: 2,
    title: 'Participants discuss in real time',
    text: 'Share ideas, challenge assumptions, and keep the thread in one place.',
    icon: MessageCircle,
  },
  {
    num: 3,
    title: 'AI generates a structured summary + decisions',
    text: 'Get outcomes you can use—no more “what did we agree?” moments.',
    icon: Sparkles,
  },
] as const;

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="border-b border-white/5 py-16 sm:py-24"
      aria-labelledby="how-works-heading"
    >
      <MContainer>
        <h2
          id="how-works-heading"
          className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          How it works
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-400 sm:text-lg">
          Three clear steps from kickoff to structured takeaways.
        </p>
        <ol className="mt-12 flex flex-col gap-8 sm:flex-row sm:items-stretch sm:gap-0">
          {steps.map((s, i) => {
            const I = s.icon;
            return (
              <li
                key={s.num}
                className="relative flex flex-1 flex-col sm:items-center sm:text-center"
              >
                {i < steps.length - 1 && (
                  <div
                    className="hidden sm:absolute sm:left-[calc(50%+3rem)] sm:top-10 sm:block sm:h-px sm:w-[calc(100%-6rem)] sm:bg-gradient-to-r sm:from-violet-500/40 sm:to-slate-700/40"
                    aria-hidden
                  />
                )}
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-slate-600/60 font-mono text-sm font-bold text-slate-300 sm:mb-3">
                  {s.num}
                </div>
                <div className="mb-2 text-violet-300">
                  <I className="mx-auto h-6 w-6 sm:mx-0" strokeWidth={1.75} aria-hidden />
                </div>
                <h3 className="text-base font-semibold text-white sm:text-lg">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{s.text}</p>
              </li>
            );
          })}
        </ol>
      </MContainer>
    </section>
  );
}
