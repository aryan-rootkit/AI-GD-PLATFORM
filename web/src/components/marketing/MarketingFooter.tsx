import { MContainer } from './Container';

const product = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#screenshots', label: 'Preview' },
  { href: '/login', label: 'Sign in' },
] as const;

const company = [
  { href: '#', label: 'About (coming soon)' },
  { href: 'mailto:hello@example.com', label: 'Contact' },
] as const;

const legal = ['Privacy (coming soon)', 'Terms (coming soon)'] as const;

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/5 bg-slate-950/80 py-12 sm:py-16" id="site-footer">
      <MContainer>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-base font-semibold text-white">AI GD Platform</p>
            <p className="mt-2 text-sm text-slate-500">
              Structured real-time group discussions with AI in the room.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Product</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              {product.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="hover:text-white">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Company</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              {company.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="hover:text-white">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href="https://github.com"
              className="mt-4 block text-sm text-slate-400 transition hover:text-white"
              rel="noreferrer"
              target="_blank"
            >
              GitHub
            </a>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Legal</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              {legal.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-slate-600">Replace with real policy URLs when you ship them.</p>
          </div>
        </div>
        <p className="mt-10 border-t border-white/5 pt-8 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} AI GD Platform. All rights reserved.
        </p>
      </MContainer>
    </footer>
  );
}
