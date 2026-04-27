/**
 * Static visual proxy for the live session + dashboard (no real screenshots required).
 * Mimics 3-column layout: sidebar | chat | AI.
 */
export function DashboardPreviewMock({ className = '' }: { className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-white/10 bg-[#0c0c0e] shadow-2xl ring-1 ring-white/5 ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-white/5 bg-[#0a0a0b] px-3 py-1.5">
        <div className="flex gap-1" aria-hidden>
          <span className="h-2 w-2 rounded-full bg-red-400/90" />
          <span className="h-2 w-2 rounded-full bg-amber-400/90" />
          <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
        </div>
        <span className="ml-1 font-mono text-[10px] text-slate-500">app · live session</span>
      </div>
      <div className="grid h-[200px] grid-cols-12 text-[9px] sm:h-[220px] sm:text-[10px]">
        <div className="col-span-3 space-y-1.5 border-r border-white/5 p-1.5">
          <div className="h-1.5 w-12 rounded bg-violet-500/40" />
          <div className="h-1.5 w-16 rounded bg-slate-700" />
          <div className="mt-1 rounded border border-violet-500/20 bg-violet-500/10 p-1">
            <div className="h-1 w-10 rounded bg-violet-300/40" />
          </div>
          <div className="h-1 w-14 rounded bg-slate-700" />
        </div>
        <div className="col-span-6 space-y-1.5 border-r border-white/5 p-1.5">
          <div className="h-1.5 w-24 rounded bg-slate-600" />
          <div className="h-1 w-full rounded bg-slate-800" />
          <div className="h-1 w-4/5 rounded bg-slate-800" />
          <div className="h-1 w-3/5 rounded bg-slate-800" />
        </div>
        <div className="col-span-3 space-y-1.5 p-1.5">
          <div className="h-1.5 w-14 rounded bg-slate-600" />
          <div className="h-1 w-full rounded bg-violet-500/20" />
          <div className="h-1 w-full rounded bg-slate-800" />
        </div>
      </div>
    </div>
  );
}
