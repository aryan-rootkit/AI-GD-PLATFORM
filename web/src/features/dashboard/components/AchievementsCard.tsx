'use client';

import type { LucideIcon } from 'lucide-react';
import { Trophy } from 'lucide-react';

export type AchievementsCardProps = {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  progress?: number;
  badge?: { id: string; label: string; icon: LucideIcon }[];
  score?: { label: string; value: number | string; max?: number }[];
};

export function AchievementsCard({
  title = 'Your Achievements',
  description = 'Preview — full progression and unlocks coming soon.',
  icon: Icon = Trophy,
  progress = 0,
  badge = [],
  score = [],
}: AchievementsCardProps) {
  return (
    <section
      className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 backdrop-blur-md transition-all duration-300 hover:border-white/20 sm:p-6"
      aria-labelledby="achievements-heading"
    >
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-amber-400/90" strokeWidth={1.75} aria-hidden />
        <h2 id="achievements-heading" className="text-base font-semibold text-white">
          {title}
        </h2>
      </div>
      {description && <p className="mt-1 text-xs text-slate-400">{description}</p>}

      {progress > 0 && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-800">
            <div
              className="h-2 rounded-full bg-amber-400/80 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {score.length > 0 && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {score.map((s, idx) => (
            <div key={idx} className="rounded-xl border border-white/5 bg-slate-800/30 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{s.label}</p>
              <p className="mt-1 flex items-baseline gap-1 text-2xl font-bold tabular-nums text-amber-200">
                {s.value}
                {s.max && <span className="text-base font-semibold text-slate-500">/{s.max}</span>}
              </p>
            </div>
          ))}
        </div>
      )}

      {badge.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Badges</p>
          <ul className="mt-2 flex flex-wrap gap-2" aria-label="Badges">
            {badge.map((b) => (
              <li
                key={b.id}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-slate-300"
              >
                <b.icon className="h-3.5 w-3.5 shrink-0 text-amber-400" strokeWidth={2} aria-hidden />
                {b.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
