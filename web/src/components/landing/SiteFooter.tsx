import Link from 'next/link';
import { Container } from './Container';
import { Mail } from 'lucide-react';

const product = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#live-demo', label: 'Live demo' },
] as const;

const legal = [
  { href: '/login', label: 'Login' },
  { href: '/signup', label: 'Create account' },
] as const;

const contactEmail = 'hello@example.com';

export function SiteFooter() {
  return (
    <footer
      className="border-t border-white/5 bg-slate-950 py-12 sm:py-16"
      id="site-footer"
    >
      <Container>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-lg font-semibold text-white">AI GD Platform</p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-500">
              Practice group discussions with a modern room experience and an AI
              co-facilitator.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Product
            </p>
            <ul className="mt-3 space-y-2">
              {product.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="text-sm text-slate-400 transition hover:text-white"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Access
            </p>
            <ul className="mt-3 space-y-2">
              {legal.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-slate-400 transition hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <a
              href="https://github.com"
              className="mt-4 block text-sm text-slate-400 transition hover:text-white"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Contact
            </p>
            <a
              href={`mailto:${contactEmail}`}
              className="mt-3 flex items-center gap-2 text-sm text-slate-400 transition hover:text-violet-300"
            >
              <Mail className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
              {contactEmail}
            </a>
          </div>
        </div>
        <p className="mt-10 border-t border-white/5 pt-8 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} AI GD Platform. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
