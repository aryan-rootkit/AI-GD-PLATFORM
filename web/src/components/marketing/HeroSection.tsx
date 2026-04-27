import type { CSSProperties } from 'react';
import Link from 'next/link';
import { MContainer } from './Container';
import { DashboardPreviewMock } from './DashboardPreviewMock';
import { ArrowRight } from 'lucide-react';

export function MarketingHeroSection() {
  return (
    <section
      className="relative border-b border-white/5 py-16 sm:py-24"
      aria-labelledby="marketing-hero"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
      >
        <div className="absolute -left-1/3 top-0 h-[420px] w-[420px] rounded-full bg-violet-600/15 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-[360px] w-[360px] rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
      </div>

      <MContainer>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <div
            className="max-w-xl animate-fade-in opacity-0"
            style={{ animationDelay: '0.05s', animationFillMode: 'forwards' } satisfies CSSProperties}
          >
            <h1
              id="marketing-hero"
              className="text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl sm:leading-tight"
            >
              AI-powered group discussion platform for structured collaboration
            </h1>
            <p className="mt-4 text-balance text-lg text-slate-400 sm:text-xl">
              Run live discussions, debates, and team sessions powered by AI summaries, insights, and
              decisions.
            </p>
            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 transition hover:bg-violet-500"
              >
                Get started
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
              </Link>
              <a
                href="#screenshots"
                className="inline-flex items-center justify-center rounded-lg border border-slate-600/80 bg-slate-900/30 px-6 py-3.5 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800/50"
              >
                View demo
              </a>
            </div>
          </div>

          <div className="relative lg:pl-4">
            <div
              className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-tr from-violet-600/20 to-transparent blur-2xl"
              aria-hidden
            />
            <div
              className="scale-[1.01] transition duration-500 hover:scale-[1.02]"
            >
              <div
                className="animate-fade-in opacity-0"
                style={{ animationDelay: '0.2s', animationFillMode: 'forwards' } satisfies CSSProperties}
              >
                <DashboardPreviewMock />
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-slate-500 sm:text-left">
              Product-style preview (not a live app screen capture)
            </p>
          </div>
        </div>
      </MContainer>
    </section>
  );
}
