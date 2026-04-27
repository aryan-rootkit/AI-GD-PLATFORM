import { MContainer } from './Container';

const quotes = [
  {
    name: 'Lena V.',
    role: 'Eng manager · Product team',
    quote: 'The difference is the structure—we leave with decisions, not a transcript nobody reads.',
  },
  {
    name: 'Marcus T.',
    role: 'University cohort lead',
    quote: 'Our groups finally sound professional in practice, not just on paper.',
  },
  {
    name: 'Priya S.',
    role: 'Program lead · Remote org',
    quote: 'We needed a layer between chaos chat and a formal report. This hits that gap.',
  },
] as const;

export function TestimonialsSection() {
  return (
    <section
      className="border-b border-white/5 py-16 sm:py-20"
      aria-labelledby="testimonial-heading"
    >
      <MContainer>
        <h2
          id="testimonial-heading"
          className="text-center text-2xl font-bold text-white sm:text-3xl"
        >
          What people say
        </h2>
        <p className="mt-1 text-center text-sm text-slate-500">Placeholder names &amp; stories</p>
        <ul className="mt-8 grid list-none grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {quotes.map((q) => (
            <li
              key={q.name}
              className="flex flex-col rounded-2xl border border-white/5 bg-slate-900/20 p-5"
            >
              <p className="text-sm leading-relaxed text-slate-300">&ldquo;{q.quote}&rdquo;</p>
              <div className="mt-3 border-t border-white/5 pt-3 text-sm">
                <p className="font-medium text-white">{q.name}</p>
                <p className="text-xs text-slate-500">{q.role}</p>
              </div>
            </li>
          ))}
        </ul>
      </MContainer>
    </section>
  );
}
