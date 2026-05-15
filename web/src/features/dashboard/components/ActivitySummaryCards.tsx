'use client';

import type { ReactNode } from 'react';
import { Activity, BarChart3, Radio } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useUserActivityQuery } from '../hooks/useDashboardQueries';
import { useRoomMeta } from '@/hooks/useRoomMeta';

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
    <div className="flex min-w-0 flex-1 flex-col gap-1 border-white/10 sm:border-l sm:pl-6 first:sm:border-l-0 first:sm:pl-0">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        <Icon className="h-3.5 w-3.5 shrink-0 text-violet-400" strokeWidth={2} aria-hidden />
        {label}
      </div>
      <div className="text-lg font-semibold tabular-nums text-white sm:text-xl">{children}</div>
    </div>
  );
}

export function ActivitySummaryCards() {
  const { hasActiveRoom } = useRoomMeta();
  const { data, isLoading } = useUserActivityQuery();

  const sessionsParticipated = data?.sessionsParticipated ?? 0;
  const lastSessionScore = data?.lastSessionScore ?? null;
  const activeSession = data?.activeSession || hasActiveRoom;

  const noHistoryYet =
    sessionsParticipated === 0 && lastSessionScore === null && !activeSession;

  return (
    <section
      className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 backdrop-blur-md transition-all duration-300 hover:border-white/20 sm:p-6"
      aria-labelledby="user-activity-overview-heading"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="user-activity-overview-heading" className="text-base font-semibold text-white">
            Overview
          </h2>
          {noHistoryYet && !isLoading && (
            <p className="mt-1 text-sm text-slate-400">No sessions yet</p>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-5 sm:mt-6 sm:flex-row sm:gap-8">
        <StatBlock label="Sessions Joined" icon={Activity}>
          {isLoading ? (
            <span className="inline-block h-7 w-10 animate-pulse rounded bg-slate-800" aria-hidden />
          ) : (
            sessionsParticipated
          )}
        </StatBlock>
        <StatBlock label="Last Score" icon={BarChart3}>
          {isLoading ? (
            <span className="inline-block h-7 w-14 animate-pulse rounded bg-slate-800" aria-hidden />
          ) : lastSessionScore === null || Number.isNaN(lastSessionScore) ? (
            <span className="text-slate-500">—</span>
          ) : (
            lastSessionScore
          )}
        </StatBlock>
        <StatBlock label="Active Session" icon={Radio}>
          {isLoading ? (
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
