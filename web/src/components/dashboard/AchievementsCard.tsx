'use client';

import { Mic2, Target, Trophy } from 'lucide-react';

/** Mock gamification stats until backend progression is wired. */
const MOCK_STATS = {
  topScore: 9,
  sessionsCount: 12,
};

const PLACEHOLDER_BADGES = [
  { id: 'top-speaker', label: 'Top Speaker', Icon: Mic2 },
  { id: 'best-argument', label: 'Best Argument', Icon: Target },
] as const;

export function AchievementsCard() {
  return (
    <section
      className="rounded-2xl border border-slate-800/90 bg-slate-900/50 p-5 sm:p-6"
      aria-labelledby="achievements-heading"
    >
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-amber-400/90" strokeWidth={1.75} aria-hidden />
        <h2 id="achievements-heading" className="text-base font-semibold text-white">
          Your Achievements
        </h2>
      </div>
      <p className="mt-1 text-xs text-slate-500">Preview — full progression and unlocks coming soon.</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Top Score</p>
          <p className="mt-1 flex items-baseline gap-1 text-2xl font-bold tabular-nums text-amber-200">
            {MOCK_STATS.topScore}
            <span className="text-base font-semibold text-slate-500">/10</span>
          </p>
        </div>
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sessions Count</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-violet-200">{MOCK_STATS.sessionsCount}</p>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Badges</p>
        <ul className="mt-2 flex flex-wrap gap-2" aria-label="Placeholder badges">
          {PLACEHOLDER_BADGES.map(({ id, label, Icon }) => (
            <li
              key={id}
              className="inline-flex items-center gap-2 rounded-full border border-dashed border-slate-600/80 bg-slate-800/40 px-3 py-1.5 text-xs font-medium text-slate-400"
            >
              <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" strokeWidth={2} aria-hidden />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
