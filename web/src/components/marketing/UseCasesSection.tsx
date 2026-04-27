import { MContainer } from './Container';
import { Video, BookOpen, Rocket, Globe, UserRound } from 'lucide-react';

const useCases = [
  { title: 'Team meetings', text: 'Align on priorities with a clear thread of what was said and decided.', icon: Video },
  { title: 'College group discussions', text: 'Practice argumentation and get structure before grades matter.', icon: BookOpen },
  { title: 'Startup brainstorming', text: 'Move from noise to a short list of next bets the room agrees on.', icon: Rocket },
  { title: 'Remote collaboration', text: 'Time zones, async prep, and live moments that still feel in-room.', icon: Globe },
  { title: 'Interview practice', text: 'Simulate pressure and get feedback you can use in the next round.', icon: UserRound },
] as const;

export function UseCasesSection() {
  return (
    <section
      className="border-b border-white/5 py-16 sm:py-20"
      aria-labelledby="use-cases-heading"
    >
      <MContainer>
        <h2
          id="use-cases-heading"
          className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          Use cases
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-400">
          Where a dedicated discussion surface beats a generic chat.
        </p>
        <ul className="mt-10 grid list-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {useCases.map((c) => {
            const I = c.icon;
            return (
              <li
                key={c.title}
                className="flex flex-col rounded-2xl border border-slate-800/80 bg-slate-900/25 p-5"
              >
                <I
                  className="h-6 w-6 text-slate-400"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <h3 className="mt-2 text-base font-semibold text-white">{c.title}</h3>
                <p className="mt-1.5 text-sm text-slate-500">{c.text}</p>
              </li>
            );
          })}
        </ul>
      </MContainer>
    </section>
  );
}
