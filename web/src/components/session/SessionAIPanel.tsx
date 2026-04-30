'use client';

import { useState } from 'react';
import { Lightbulb, BarChart2, Sparkles, ChevronRight, Mic } from 'lucide-react';

const tabs = [
  { id: 'suggest' as const, label: 'Live suggestions', short: 'Suggestions', icon: Lightbulb },
  { id: 'perf' as const, label: 'Performance', short: 'Performance', icon: BarChart2 },
  { id: 'insights' as const, label: 'AI insights', short: 'Insights', icon: Sparkles },
];

/** Primary moderator nudge vs secondary list (ui-only). */
const MAIN_SUGGESTION = 'Invite a quieter member to share their view before you move on.';
const SECONDARY_SUGGESTIONS = ['Add a concrete example', 'Clarify your point', 'Time-check the group'];

const PLACEHOLDER_FEEDBACK = 'Try adding more clarity to your point';

export function SessionAIPanel({ sessionTitle }: { sessionTitle: string }) {
  const [open, setOpen] = useState<(typeof tabs)[number]['id']>('suggest');

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-slate-700/80 px-3 py-2 sm:px-4 sm:py-2.5">
        <div className="flex items-center gap-2">
          <Mic className="h-4 w-4 shrink-0 text-violet-400" strokeWidth={2} aria-hidden />
          <h2 className="text-sm font-semibold text-white sm:text-base">AI Moderator</h2>
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs text-slate-500" title={sessionTitle}>
          {sessionTitle}
        </p>
      </div>
      <div className="flex border-b border-slate-800" role="tablist" aria-label="AI Moderator">
        {tabs.map((t) => {
          const I = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={open === t.id}
              onClick={() => setOpen(t.id)}
              className={`flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 border-b-2 py-1.5 text-xs font-medium transition sm:flex-row sm:gap-1.5 ${
                open === t.id
                  ? 'border-violet-500 text-violet-200'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <I className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.75} aria-hidden />
              <span className="max-sm:hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.short}</span>
            </button>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4" role="tabpanel">
        {open === 'suggest' && <SuggestionsView />}
        {open === 'perf' && <PerformanceView />}
        {open === 'insights' && <InsightsView sessionTitle={sessionTitle} />}
      </div>
    </div>
  );
}

function SuggestionsView() {
  return (
    <div className="space-y-5">
      <div
        className="rounded-xl border border-amber-500/25 bg-amber-950/20 px-3 py-2.5 sm:px-4 sm:py-3"
        role="status"
        aria-live="polite"
      >
        <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-200/80">Live feedback</p>
        <p className="mt-1 text-sm leading-relaxed text-amber-100/95">{PLACEHOLDER_FEEDBACK}</p>
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-400/90">Main suggestion</p>
        <div className="mt-2 rounded-xl border border-violet-500/35 bg-violet-950/30 px-4 py-4 shadow-inner shadow-black/20">
          <p className="text-base font-medium leading-snug text-slate-50">{MAIN_SUGGESTION}</p>
        </div>
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Also consider</p>
        <ul className="mt-2 space-y-1.5">
          {SECONDARY_SUGGESTIONS.map((c) => (
            <li
              key={c}
              className="group flex items-center justify-between gap-2 rounded-lg border border-slate-700/50 bg-slate-800/30 px-3 py-2 text-sm text-slate-300"
            >
              <span>{c}</span>
              <ChevronRight
                className="h-4 w-4 shrink-0 text-slate-600 group-hover:text-violet-400/90"
                aria-hidden
              />
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-slate-600">Suggestions are illustrative until the room is wired to model output.</p>
    </div>
  );
}

function PerformanceView() {
  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-400">Indicative scores (mock data until sessions are linked).</p>
      <div>
        <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
          <span>Speaking balance</span>
          <span className="text-violet-300">72 / 100</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full w-[72%] rounded-full bg-violet-500/90" aria-label="72 percent" />
        </div>
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
          <span>Participation</span>
          <span className="text-violet-300">64%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full w-[64%] rounded-full bg-indigo-500/90" aria-label="64 percent" />
        </div>
      </div>
    </div>
  );
}

function InsightsView({ sessionTitle }: { sessionTitle: string }) {
  return (
    <div className="space-y-4 text-sm text-slate-300">
      <p className="text-slate-500">What the AI could surface after the next milestone.</p>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Summary</p>
        <p className="mt-1 leading-relaxed text-slate-200">
          Participants are framing trade-offs in “<span className="text-violet-200">{sessionTitle}</span>” around
          scope vs. time—good alignment for a follow-up.
        </p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Key arguments</p>
        <ul className="mt-1 list-inside list-disc text-slate-300">
          <li>Risk of shipping without validation</li>
          <li>Value of a thin end-to-end slice</li>
        </ul>
      </div>
    </div>
  );
}
