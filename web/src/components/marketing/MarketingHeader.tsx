'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { MContainer } from './Container';

const centerLinks = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#screenshots', label: 'Screenshots' },
  { href: '#pricing', label: 'Pricing' },
] as const;

export function MarketingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/60">
      <MContainer
        as="div"
        className="grid h-16 grid-cols-[1fr_auto] items-center gap-2 min-[900px]:h-[4.25rem] min-[900px]:grid-cols-[auto_1fr_auto] min-[900px]:items-center"
      >
        <div className="min-w-0">
          <Link href="/" className="text-lg font-semibold tracking-tight text-white">
            AI GD Platform
          </Link>
        </div>

        <nav
          className="row-start-2 col-span-2 hidden flex-wrap items-center justify-center justify-self-center gap-x-6 gap-y-1 min-[900px]:col-span-1 min-[900px]:row-start-auto min-[900px]:flex"
          aria-label="Page sections"
        >
          {centerLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="whitespace-nowrap text-sm text-slate-400 transition hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden min-[900px]:flex min-[900px]:items-center min-[900px]:gap-2 min-[900px]:justify-self-end min-[900px]:sm:gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-300 transition hover:text-white"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-violet-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
          >
            Get started
          </Link>
        </div>

        <button
          type="button"
          className="col-start-2 row-start-1 inline-flex min-[900px]:hidden"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span className="p-2 text-slate-200">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </span>
        </button>
      </MContainer>

      {open && (
        <div className="border-b border-white/5 bg-slate-950/95 min-[900px]:hidden">
          <MContainer className="flex flex-col gap-1 py-3">
            {centerLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-md px-2 py-2.5 text-sm text-slate-200 hover:bg-white/5"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/login"
              className="mt-1 rounded-md px-2 py-2.5 text-sm text-slate-200 hover:bg-white/5"
              onClick={() => setOpen(false)}
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-violet-600 py-2.5 text-center text-sm font-semibold text-white"
              onClick={() => setOpen(false)}
            >
              Get started
            </Link>
          </MContainer>
        </div>
      )}
    </header>
  );
}
