import Link from "next/link";
import { GlassCard } from "@/components/platform/ui/GlassCard";
import { Badge } from "@/components/platform/ui/Badge";
import {
  ATHENA_DESCRIPTION,
  ATHENA_FOCUS,
  ATHENA_NAME,
  ATHENA_TAGLINE,
} from "@/lib/branding";
import {
  aiSuggestions,
  recentSessions,
  studentOverview,
  subjectTracks,
} from "@/lib/data/platform-mock";

export function DashboardHub({ userName }: { userName: string }) {
  return (
    <div className="platform-page space-y-10">
      <section className="platform-hero">
        <div>
          <p className="platform-eyebrow">{ATHENA_NAME} Training Hub</p>
          <h1 className="platform-title">Welcome back, {userName}</h1>
          <p className="text-xs text-platform-muted mt-1">{ATHENA_TAGLINE}</p>
          <p className="platform-subtitle max-w-2xl mt-3">{ATHENA_DESCRIPTION}</p>
          <p className="text-sm text-platform-muted max-w-2xl mt-2">{ATHENA_FOCUS}</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full lg:w-auto">
          <Stat label="Streak" value={`${studentOverview.streak} days`} />
          <Stat label="Practice" value={`${studentOverview.practiceHours}h`} />
          <Stat label="Last score" value={`${studentOverview.lastSessionScore}%`} />
          <GlassCard className="flex items-center justify-center !p-4">
            <Link href="/interview/setup" className="platform-btn-primary text-sm">
              Resume practice
            </Link>
          </GlassCard>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        <Link href="/interview/setup">
          <GlassCard hover className="!p-8 min-h-[180px] flex flex-col justify-between">
            <div>
              <Badge>Core</Badge>
              <h2 className="text-xl font-semibold text-white mt-4">Start Mock Interview</h2>
              <p className="text-sm text-platform-muted mt-2">
                Role-based rounds with ATHENA voice evaluation and narrative analysis.
              </p>
            </div>
            <span className="text-sm text-platform-accent mt-6">Configure & begin →</span>
          </GlassCard>
        </Link>
        <Link href="/gd/setup">
          <GlassCard hover className="!p-8 min-h-[180px] flex flex-col justify-between">
            <div>
              <Badge variant="success">USP</Badge>
              <h2 className="text-xl font-semibold text-white mt-4">Start Group Discussion</h2>
              <p className="text-sm text-platform-muted mt-2">
                Structured GD practice with AI moderation and communication scoring.
              </p>
            </div>
            <span className="text-sm text-platform-accent mt-6">Join discussion →</span>
          </GlassCard>
        </Link>
      </section>

      <section>
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Subject-wise preparation tracks</h2>
          <span className="text-xs text-platform-muted">Structured progression</span>
        </div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {subjectTracks.map((track) => (
            <GlassCard key={track.id} hover className="!p-5">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-medium text-white">{track.name}</h3>
                <Badge variant="muted">{track.difficulty}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-platform-muted">
                <span>{track.attempts} attempts</span>
                <span>Avg {track.averageScore}%</span>
              </div>
              <p className="text-xs text-platform-muted mt-3">
                Weak: {track.weakAreas.join(", ")}
              </p>
              <div className="platform-progress mt-4">
                <div
                  className="platform-progress-bar"
                  style={{ width: `${track.progress}%` }}
                />
              </div>
              <Link
                href="/interview/setup"
                className="inline-block mt-4 text-xs text-platform-accent hover:underline"
              >
                Continue practice
              </Link>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-white mb-4">Recent sessions</h2>
          <div className="space-y-3">
            {recentSessions.map((s) => (
              <GlassCard
                key={s.id}
                className="!p-4 flex flex-wrap gap-4 justify-between items-center"
              >
                <div>
                  <p className="font-medium text-white">{s.title}</p>
                  <p className="text-xs text-platform-muted mt-1">{s.summary}</p>
                </div>
                <div className="flex gap-3 text-xs text-platform-muted items-center">
                  <span>{s.score}%</span>
                  <span>{s.duration}</span>
                  <Badge variant={s.confidence === "High" ? "success" : "muted"}>
                    {s.confidence}
                  </Badge>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">ATHENA insights</h2>
          <div className="space-y-3">
            {aiSuggestions.map((s) => (
              <GlassCard key={s.id} className="!p-4">
                <p className="text-sm text-platform-text">{s.message}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <GlassCard className="!p-4 text-center min-w-[120px]">
      <p className="text-xs text-platform-muted">{label}</p>
      <p className="text-lg font-semibold text-white mt-1">{value}</p>
    </GlassCard>
  );
}
