import type { ReactNode } from 'react';

type Props = {
  title: string;
  description: string;
  icon: ReactNode;
};

export function FeatureCard({ title, description, icon }: Props) {
  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-slate-900/40 p-6 shadow-sm transition hover:border-violet-500/25 hover:bg-slate-900/60"
    >
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-300">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
    </article>
  );
}
