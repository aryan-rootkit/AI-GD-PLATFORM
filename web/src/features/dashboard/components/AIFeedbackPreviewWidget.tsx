'use client';

import Link from 'next/link';
import { useAIFeedbackPreviewQuery } from '../hooks/useDashboardQueries';
import { Sparkles } from 'lucide-react';

export function AIFeedbackPreviewWidget() {
  const { preview, source, isLoading, isEmpty } = useAIFeedbackPreviewQuery();

  return (
    <section
      className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 backdrop-blur-md transition-all duration-300 hover:border-white/20 sm:p-6"
      aria-labelledby="ai-feedback-preview-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 shrink-0 text-amber-400/90" strokeWidth={1.75} aria-hidden />
          <h2 id="ai-feedback-preview-heading" className="text-base font-semibold text-white">
            AI Feedback Preview
          </h2>
        </div>
        {source === 'demo' && (
          <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Example
          </span>
        )}
      </div>

      {isLoading && (
        <div className="mt-5 space-y-3" aria-busy>
          <div className="h-8 w-16 animate-pulse rounded bg-slate-800" />
          <div className="h-4 w-full max-w-md animate-pulse rounded bg-slate-800" />
          <div className="h-4 w-full max-w-sm animate-pulse rounded bg-slate-800" />
        </div>
      )}

      {isEmpty && (
        <p className="mt-4 text-sm text-slate-500">Complete a session to get feedback</p>
      )}

      {preview && !isLoading && (
        <div className="mt-5 space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Last session score</p>
            {preview.lastSessionScore != null ? (
              <p className="mt-1 text-3xl font-bold tabular-nums text-violet-300">
                {preview.lastSessionScore}
                <span className="text-lg font-semibold text-slate-500">/10</span>
              </p>
            ) : (
              <p className="mt-1 text-2xl font-semibold text-slate-500">—</p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Strength</p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{preview.strength}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Improvement</p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{preview.improvement}</p>
            </div>
          </div>
          {source === 'live' && (
            <p className="text-xs text-slate-500">
              From your most recent ended session.{' '}
              <Link href="/dashboard/history" className="text-violet-400 hover:underline hover:text-violet-300">
                View history
              </Link>
            </p>
          )}
        </div>
      )}
    </section>
  );
}
