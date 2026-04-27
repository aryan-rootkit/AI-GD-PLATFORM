import { MContainer } from './Container';
import { Monitor, LayoutPanelLeft, Bot } from 'lucide-react';

/** Placeholder photos (replace with product shots when ready). */
const previews = [
  {
    title: 'Live session',
    sub: 'Room + chat + presence',
    imageSrc: 'https://picsum.photos/seed/aigd-live/960/540',
    icon: Monitor,
    content: (
      <div className="space-y-1.5 p-2 text-[8px] text-slate-400 sm:text-[9px]">
        <div className="flex justify-between">
          <span className="text-slate-500"># strategy-sync</span>
          <span className="text-emerald-500/80">Live</span>
        </div>
        <div className="h-1.5 w-3/4 rounded bg-slate-800" />
        <div className="h-1.5 w-1/2 rounded bg-slate-800" />
        <div className="ml-4 h-1.5 w-2/3 rounded bg-slate-700" />
        <div className="h-1.5 w-2/3 rounded border border-violet-500/20 bg-violet-500/10" />
      </div>
    ),
  },
  {
    title: 'AI summary',
    sub: 'Structured takeaways',
    imageSrc: 'https://picsum.photos/seed/aigd-summary/960/540',
    icon: LayoutPanelLeft,
    content: (
      <div className="space-y-1.5 p-2 text-[8px] sm:text-[9px]">
        <p className="text-[7px] font-medium uppercase text-slate-500">Summary</p>
        <div className="h-1 w-full rounded bg-slate-800" />
        <div className="h-1 w-5/6 rounded bg-slate-800" />
        <p className="pt-1 text-[7px] font-medium uppercase text-slate-500">Decisions</p>
        <div className="h-1 w-4/5 rounded bg-violet-500/20" />
        <div className="h-1 w-3/4 rounded bg-slate-800" />
      </div>
    ),
  },
  {
    title: 'Discussion + AI',
    sub: 'Moderation layer',
    imageSrc: 'https://picsum.photos/seed/aigd-ai/960/540',
    icon: Bot,
    content: (
      <div className="space-y-1.5 p-2 text-[8px] sm:text-[9px]">
        <div className="h-1.5 w-2/3 rounded bg-slate-800" />
        <div className="h-1.5 w-1/2 rounded bg-slate-800" />
        <div className="mt-1 rounded border border-violet-500/30 bg-violet-500/5 p-1.5">
          <span className="text-violet-300/90">AI</span>
          <div className="mt-0.5 h-1 w-full rounded bg-violet-500/20" />
        </div>
      </div>
    ),
  },
] as const;

export function ScreenshotsSection() {
  return (
    <section
      id="screenshots"
      className="border-b border-white/5 py-16 sm:py-24"
      aria-labelledby="shots-heading"
    >
      <MContainer>
        <h2
          id="shots-heading"
          className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          Product preview
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-400 sm:text-lg">
          Placeholder photography for layout—swap in your own product shots anytime.
        </p>
        <ul className="mt-10 grid list-none grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {previews.map((p) => {
            const I = p.icon;
            return (
              <li
                key={p.title}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40"
              >
                <div className="relative transition duration-500 ease-out group-hover:scale-[1.02]">
                  <div className="border-b border-white/5 bg-[#0a0a0b] px-3 py-1.5">
                    <div className="flex items-center gap-2 text-xs text-slate-200">
                      <I className="h-3.5 w-3.5 text-violet-300" strokeWidth={1.8} />
                      <span className="font-medium">{p.title}</span>
                    </div>
                    <p className="text-[10px] text-slate-500">{p.sub}</p>
                  </div>
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
                    <img
                      src={p.imageSrc}
                      alt=""
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                    <div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"
                      aria-hidden
                    />
                  </div>
                  <div className="min-h-[100px] border-t border-white/5 bg-slate-950/80">{p.content}</div>
                </div>
              </li>
            );
          })}
        </ul>
      </MContainer>
    </section>
  );
}
