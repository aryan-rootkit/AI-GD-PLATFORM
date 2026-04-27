import Link from 'next/link';
import { Container } from './Container';

const nav = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it Works' },
  { href: '#live-demo', label: 'Live Demo' },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/60">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4 sm:h-[4.5rem]">
          <Link
            href="/"
            className="shrink-0 text-lg font-semibold tracking-tight text-white transition hover:text-violet-300"
          >
            AI GD Platform
          </Link>

          <nav
            className="hidden items-center gap-1 md:flex md:gap-6"
            aria-label="Primary"
          >
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-slate-300 transition hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-300 transition hover:text-white"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-violet-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-violet-500 sm:px-4"
            >
              Signup
            </Link>
          </div>
        </div>
        <div className="border-t border-white/5 py-2 md:hidden">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-slate-400 transition hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </Container>
    </header>
  );
}
