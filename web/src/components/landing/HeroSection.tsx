import Link from 'next/link';
import { Container } from './Container';

export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden border-b border-white/5 py-20 sm:py-28"
      aria-labelledby="hero-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
      >
        <div className="absolute -left-1/4 top-0 h-[480px] w-[480px] rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute -right-1/4 top-1/2 h-[400px] w-[400px] rounded-full bg-indigo-600/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-px w-2/3 bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
      </div>

      <Container className="text-center">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-violet-400/90 sm:text-sm">
          Real-time group learning
        </p>
        <h1
          id="hero-heading"
          className="mx-auto max-w-3xl text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl sm:leading-tight md:text-6xl"
        >
          Practice group discussions with AI-powered feedback
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-slate-400 sm:text-lg">
          Run structured sessions, collaborate with your team, and get instant nudges from
          an AI moderator—so you sharpen communication skills before the interview or the
          high-stakes meeting.
        </p>
        <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:mt-12 sm:flex-row sm:items-center">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-lg bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:bg-violet-500 sm:px-8"
          >
            Start Session
          </Link>
          <a
            href="#live-demo"
            className="inline-flex items-center justify-center rounded-lg border border-slate-600/80 bg-slate-900/50 px-6 py-3.5 text-sm font-semibold text-slate-100 backdrop-blur transition hover:border-slate-500 hover:bg-slate-800/80 sm:px-8"
          >
            Watch Demo
          </a>
        </div>
      </Container>
    </section>
  );
}
