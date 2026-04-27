import Link from 'next/link';
import { MContainer } from './Container';

export function FinalCtaSection() {
  return (
    <section
      className="relative border-b border-white/5 py-20 sm:py-28"
      aria-labelledby="final-cta"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
      >
        <div className="absolute left-1/2 top-1/2 h-[min(100%,28rem)] w-[min(100%,42rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/15 blur-3xl" />
        <div className="absolute right-0 top-0 h-32 w-32 bg-indigo-500/20 blur-3xl" />
      </div>
      <MContainer>
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="final-cta"
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Start running smarter group discussions with AI
          </h2>
          <p className="mt-3 text-slate-400 sm:text-lg">
            Sign in with your team when you&rsquo;re ready—no change to the existing app flow.
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-violet-500"
            >
              Get started
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-slate-600/80 bg-slate-900/30 px-6 py-3.5 text-sm font-medium text-slate-100 transition hover:bg-slate-800/50"
            >
              Sign in
            </Link>
          </div>
        </div>
      </MContainer>
    </section>
  );
}
