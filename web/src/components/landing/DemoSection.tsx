import { Play } from 'lucide-react';
import { Container } from './Container';

/** Default is a public YouTube sample — set `YOUTUBE_EMBED` to your own demo. */
const YOUTUBE_EMBED =
  'https://www.youtube.com/embed/jNQXAC9IVRw?modestbranding=1&rel=0';

export function DemoSection() {
  return (
    <section
      id="live-demo"
      className="border-t border-b border-white/5 bg-slate-900/30 py-20 sm:py-24"
      aria-labelledby="demo-heading"
    >
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="demo-heading"
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            See it in action
          </h2>
          <p className="mt-3 text-slate-400 sm:text-lg">
            A quick walkthrough of sessions, the moderator, and the room experience.
          </p>
        </div>

        <div className=" relative mx-auto mt-10 max-w-4xl">
          <div
            className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-b from-violet-500/20 to-transparent p-px"
            aria-hidden
          />
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 shadow-2xl ring-1 ring-white/5">
            <div className="flex items-center justify-between border-b border-white/5 bg-slate-900/50 px-4 py-2.5">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="h-2 w-2 rounded-full bg-red-400/80" />
                <span className="h-2 w-2 rounded-full bg-amber-400/80" />
                <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
                <span className="ml-1 font-mono text-slate-500">demo</span>
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-violet-300/90">
                <Play className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                Product demo
              </span>
            </div>
            <div className="aspect-video w-full bg-slate-950">
              <iframe
                className="h-full w-full"
                src={YOUTUBE_EMBED}
                title="Product demo (replace with your video URL)"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
