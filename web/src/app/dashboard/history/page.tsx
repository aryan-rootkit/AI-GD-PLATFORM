'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { SessionEvaluation, SessionHistoryItem } from '@/types/sessionHistory';
import { API_BASE_URL } from '@/utils/constants';
import { ChevronDown, ChevronRight, History } from 'lucide-react';

function formatHistoryDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

function summaryFromEvaluation(ev: SessionEvaluation | null, max = 140): string {
  if (!ev) return 'No evaluation recorded.';
  const parts = [ev.strengths?.trim(), ev.improvements?.trim()].filter(Boolean);
  if (parts.length === 0) return 'No feedback recorded.';
  const t = parts.join(' ');
  if (t.length <= max) return t;
  return `${t.slice(0, max).trimEnd()}…`;
}

const METRIC_LABELS: { key: keyof SessionEvaluation['metrics']; label: string }[] = [
  { key: 'communication', label: 'Communication' },
  { key: 'engagement', label: 'Engagement' },
  { key: 'clarity', label: 'Clarity' },
  { key: 'confidence', label: 'Confidence' },
];

export default function DashboardHistoryPage() {
  const [items, setItems] = useState<SessionHistoryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!API_BASE_URL) {
      setItems(null);
      return;
    }
    setError(null);
    try {
      const { data } = await api.get<SessionHistoryItem[]>('/api/sessions/history');
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setItems(null);
      setError(e instanceof Error ? e.message : 'Could not load history');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold text-white">
          <History className="h-6 w-6 text-violet-400" strokeWidth={1.75} aria-hidden />
          History
        </h1>
        <p className="mt-1 max-w-xl text-sm text-slate-400">
          Ended sessions you hosted or joined, with scores and feedback from when the host ended the room.
        </p>
      </div>

      {!API_BASE_URL && (
        <p className="rounded-lg border border-amber-800 bg-amber-950/40 px-4 py-3 text-sm text-amber-100">
          Set <code className="font-mono">NEXT_PUBLIC_API_URL</code> in <code className="font-mono">.env.local</code>{' '}
          to load session history.
        </p>
      )}

      {API_BASE_URL && items === null && !error && (
        <ul className="space-y-3" aria-busy>
          {[1, 2, 3].map((i) => (
            <li
              key={i}
              className="h-24 animate-pulse rounded-xl border border-slate-800/80 bg-slate-900/40"
              aria-hidden
            />
          ))}
        </ul>
      )}

      {error && (
        <p className="rounded-lg bg-rose-950/50 px-4 py-3 text-sm text-rose-100">{error}</p>
      )}

      {items && items.length === 0 && (
        <div
          className="rounded-xl border border-dashed border-slate-700/90 bg-slate-900/30 px-4 py-10 text-center text-sm text-slate-500"
          role="status"
        >
          No ended sessions yet. When a host ends a session, it will appear here with feedback.
        </div>
      )}

      {items && items.length > 0 && (
        <ul className="space-y-3" aria-label="Session history">
          {items.map((row) => {
            const open = expandedId === row.sessionId;
            const ev = row.evaluation;
            return (
              <li
                key={row.sessionId}
                className="overflow-hidden rounded-xl border border-slate-800/90 bg-slate-900/40"
              >
                <button
                  type="button"
                  onClick={() => toggle(row.sessionId)}
                  className="flex w-full items-start gap-3 px-4 py-4 text-left transition hover:bg-slate-800/40"
                  aria-expanded={open}
                >
                  <span className="mt-0.5 shrink-0 text-slate-500" aria-hidden>
                    {open ? (
                      <ChevronDown className="h-4 w-4" strokeWidth={2} />
                    ) : (
                      <ChevronRight className="h-4 w-4" strokeWidth={2} />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-2 gap-y-1">
                      <span className="font-medium text-slate-100">{row.title}</span>
                      <span
                        className={[
                          'rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums',
                          row.evaluation != null
                            ? 'bg-violet-500/20 text-violet-200'
                            : 'bg-slate-800 text-slate-500',
                        ].join(' ')}
                      >
                        {row.evaluation != null ? `Score ${row.evaluation.score}/10` : 'No score'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                      {summaryFromEvaluation(row.evaluation)}
                    </p>
                  </div>
                </button>
                {open && (
                  <div className="border-t border-slate-800/80 px-4 py-3 pl-11 text-sm text-slate-400">
                    <p>
                      <span className="text-slate-500">Session ID</span>{' '}
                      <code className="break-all font-mono text-xs text-slate-300">{row.sessionId}</code>
                    </p>
                    <p className="mt-2">
                      <span className="text-slate-500">Date</span> {formatHistoryDate(row.date)}
                    </p>
                    {ev ? (
                      <div className="mt-3 space-y-3 text-slate-300">
                        {ev.strengths?.trim() ? (
                          <p className="leading-relaxed">
                            <span className="block text-xs font-medium uppercase tracking-wider text-slate-500">
                              Strengths
                            </span>
                            {ev.strengths}
                          </p>
                        ) : null}
                        {ev.improvements?.trim() ? (
                          <p className="leading-relaxed">
                            <span className="block text-xs font-medium uppercase tracking-wider text-slate-500">
                              Improvements
                            </span>
                            {ev.improvements}
                          </p>
                        ) : null}
                        <div>
                          <span className="block text-xs font-medium uppercase tracking-wider text-slate-500">
                            Metrics (1–10)
                          </span>
                          <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {METRIC_LABELS.map(({ key, label }) => (
                              <li
                                key={key}
                                className="rounded-lg border border-slate-800/80 bg-slate-950/40 px-2 py-2 text-center"
                              >
                                <span className="block text-[10px] uppercase tracking-wide text-slate-500">
                                  {label}
                                </span>
                                <span className="text-sm font-semibold tabular-nums text-violet-200">
                                  {ev.metrics[key]}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
