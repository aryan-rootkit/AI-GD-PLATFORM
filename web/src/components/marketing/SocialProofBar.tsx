import { MContainer } from './Container';

const stats = [
  { value: '10,000+', label: 'Sessions' },
  { value: '500+', label: 'Teams' },
  { value: '15+', label: 'Countries' },
] as const;

export function SocialProofBar() {
  return (
    <section
      className="border-b border-white/5 bg-slate-900/30 py-6"
      aria-label="Trust metrics"
    >
      <MContainer>
        <p className="mb-4 text-center text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
          Trusted for AI-driven collaboration
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {s.value}
              </p>
              <p className="text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </MContainer>
    </section>
  );
}
