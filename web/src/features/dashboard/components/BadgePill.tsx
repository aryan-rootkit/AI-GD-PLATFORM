'use client';

import type { LucideIcon } from 'lucide-react';

type Props = {
  label: string;
  icon: LucideIcon;
};

export function BadgePill({ label, icon: Icon }: Props) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-slate-300 shadow-sm transition-colors hover:bg-slate-700/50">
      <Icon className="h-3.5 w-3.5 shrink-0 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" strokeWidth={2} aria-hidden />
      {label}
    </div>
  );
}
