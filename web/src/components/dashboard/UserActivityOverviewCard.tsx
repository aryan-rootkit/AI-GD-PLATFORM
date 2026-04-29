'use client';

import type { ReactNode } from 'react';
import type { UserActivityOverview } from '@/types/userActivity';
import type { LucideIcon } from 'lucide-react';
import { Activity, BarChart3, Radio } from 'lucide-react';

type Props = {
  overview: UserActivityOverview;
  loading: boolean;
};

function StatBlock({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1 border-slate-800/80 sm:border-l sm:pl-6 first:sm:border-l-0 first:sm:pl-0">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
        <Icon className="h-3.5 w-3.5 shrink-0 text-violet-400/90" strokeWidth={2} aria-hidden />
        {label}
      </div>
      <div className="text-lg font-semibold tabular-nums text-white sm:text-xl">{children}</div>
    </div>
  );
}

export function UserActivityOverviewCard({ overview, loading }: Props) {
  const { sessionsParticipated, lastSessionScore, activeSession } = overview;

  const noHistoryYet =
    sessionsParticipated === 0 &&
    (lastSessionScore === null || lastSessionScore === undefined) &&
    !activeSession;

  return (
    <section
      className="rounded-2xl border border-slate-800/90 bg-slate-900/50 p-5 sm:p-6"
      aria-labelledby="user-activity-overview-heading"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="user-activity-overview-heading" className="text-base font-semibold text-white">
            User activity overview
          </h2>
          {noHistoryYet && !loading && (
            <p className="mt-1 text-sm text-slate-500">No sessions yet</p>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-5 sm:mt-6 sm:flex-row sm:gap-8">
        <StatBlock label="Sessions Joined" icon={Activity}>
          {loading ? (
            <span className="inline-block h-7 w-10 animate-pulse rounded bg-slate-800" aria-hidden />
          ) : (
            sessionsParticipated
          )}
        </StatBlock>
        <StatBlock label="Last Score" icon={BarChart3}>
          {loading ? (
            <span className="inline-block h-7 w-14 animate-pulse rounded bg-slate-800" aria-hidden />
          ) : lastSessionScore === null || Number.isNaN(lastSessionScore) ? (
            <span className="text-slate-500">—</span>
          ) : (
            lastSessionScore
          )}
        </StatBlock>
        <StatBlock label="Active Session" icon={Radio}>
          {loading ? (
            <span className="inline-block h-7 w-16 animate-pulse rounded bg-slate-800" aria-hidden />
          ) : activeSession ? (
            <span className="text-emerald-400">Yes</span>
          ) : (
            <span className="text-slate-500">No</span>
          )}
        </StatBlock>
      </div>
    </section>
  );
}
