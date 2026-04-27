import Link from 'next/link';
import { MContainer } from './Container';
import { Check } from 'lucide-react';

const bullets = [
  'Live group rooms',
  'AI-assisted summaries (roadmap placeholder)',
  'Session history (roadmap placeholder)',
  'Email support (placeholder)',
] as const;

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="border-b border-white/5 py-16 sm:py-20"
      aria-labelledby="price-heading"
    >
      <MContainer>
        <h2
          id="price-heading"
          className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          Simple, transparent
        </h2>
        <p className="mt-2 text-center text-slate-400">Static placeholder—replace when billing is live.</p>
        <div className="mx-auto mt-8 max-w-md">
          <div className="rounded-2xl border border-violet-500/20 bg-slate-900/40 p-6 shadow-xl shadow-violet-950/20">
            <p className="text-sm font-medium text-violet-200">Early access</p>
            <p className="mt-1">
              <span className="text-4xl font-bold text-white">$0</span>
              <span className="ml-1 text-slate-500">/ user / mo (placeholder)</span>
            </p>
            <ul className="mt-5 space-y-2.5 text-sm text-slate-300">
              {bullets.map((b) => (
                <li key={b} className="flex gap-2">
                  <Check className="h-4 w-4 shrink-0 text-violet-400" strokeWidth={2} />
                  {b}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="mt-6 flex w-full items-center justify-center rounded-lg bg-violet-600 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
            >
              Get started
            </Link>
          </div>
        </div>
      </MContainer>
    </section>
  );
}
