'use client';

import type { LucideIcon } from 'lucide-react';
import { Trophy } from 'lucide-react';
import { ProgressWidget } from './ProgressWidget';
import { BadgePill } from './BadgePill';

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
  progress,
  badge: badges = [],
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

      {typeof progress === 'number' && (
        <div className="mb-6 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
          <ProgressWidget label="Progress" progress={progress} />
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

      {badges && badges.length > 0 && (
        <div className="mt-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h4 className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Badges
          </h4>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, i) => (
              <BadgePill key={i} label={badge.label} icon={badge.icon} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
