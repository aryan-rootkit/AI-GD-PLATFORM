import Link from "next/link";
import { GlassCard } from "@/components/platform/ui/GlassCard";
import { Badge } from "@/components/platform/ui/Badge";
import {
  defaultAnalytics,
  type AnalyticsMetrics,
} from "@/lib/data/platform-mock";

interface SessionAnalyticsReportProps {
  role: string;
  interviewId?: string;
  totalScore?: number;
  finalAssessment?: string;
  strengths?: string[];
  areasForImprovement?: string[];
  categoryScores?: Array<{ name: string; score: number; comment: string }>;
  metrics?: AnalyticsMetrics;
  createdAt?: string;
}

const metricLabels: Record<keyof AnalyticsMetrics, string> = {
  communication: "Communication",
  confidence: "Confidence",
  clarity: "Clarity",
  fillerWords: "Filler words",
  speakingBalance: "Speaking balance",
  interruptions: "Interruptions",
  responseQuality: "Response quality",
  leadership: "Leadership",
  emotionalStability: "Emotional stability",
};

export function SessionAnalyticsReport({
  role,
  interviewId,
  totalScore,
  finalAssessment,
  strengths = [],
  areasForImprovement = [],
  categoryScores = [],
  metrics = defaultAnalytics,
  createdAt,
}: SessionAnalyticsReportProps) {
  const score = totalScore ?? Math.round(
    (metrics.communication + metrics.confidence + metrics.clarity) / 3
  );

  return (
    <div className="platform-page max-w-4xl mx-auto space-y-8">
      <header>
        <p className="platform-eyebrow">Performance report</p>
        <h1 className="platform-title capitalize">{role} session</h1>
        {createdAt && (
          <p className="text-sm text-platform-muted mt-1">{createdAt}</p>
        )}
      </header>

      <GlassCard className="!p-8 flex flex-wrap items-center justify-between gap-6">
        <div>
          <p className="text-sm text-platform-muted">Overall score</p>
          <p className="text-5xl font-semibold text-white mt-1">
            {score}
            <span className="text-2xl text-platform-muted">/100</span>
          </p>
        </div>
        <Badge variant={score >= 80 ? "success" : score >= 60 ? "default" : "warning"}>
          {score >= 80 ? "Strong" : score >= 60 ? "Improving" : "Needs focus"}
        </Badge>
      </GlassCard>

      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Communication metrics</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(Object.keys(metricLabels) as Array<keyof AnalyticsMetrics>).map(
            (key) => (
              <GlassCard key={key} className="!p-4">
                <p className="text-xs text-platform-muted">{metricLabels[key]}</p>
                <p className="text-xl font-semibold text-white mt-1">
                  {key === "fillerWords" || key === "interruptions"
                    ? metrics[key]
                    : `${metrics[key]}%`}
                </p>
              </GlassCard>
            )
          )}
        </div>
      </section>

      {finalAssessment && (
        <GlassCard className="!p-6">
          <h2 className="text-lg font-semibold text-white mb-3">AI summary</h2>
          <p className="text-sm text-platform-text leading-relaxed">{finalAssessment}</p>
        </GlassCard>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard className="!p-6">
          <h3 className="font-medium text-white mb-3">Strengths</h3>
          <ul className="space-y-2 text-sm text-platform-text">
            {strengths.length > 0 ? (
              strengths.map((s, i) => (
                <li key={i} className="list-none flex gap-2">
                  <span className="text-platform-accent">+</span> {s}
                </li>
              ))
            ) : (
              <li className="list-none text-platform-muted">No data yet</li>
            )}
          </ul>
        </GlassCard>
        <GlassCard className="!p-6">
          <h3 className="font-medium text-white mb-3">Improvement areas</h3>
          <ul className="space-y-2 text-sm text-platform-text">
            {areasForImprovement.length > 0 ? (
              areasForImprovement.map((s, i) => (
                <li key={i} className="list-none flex gap-2">
                  <span className="text-platform-muted">→</span> {s}
                </li>
              ))
            ) : (
              <li className="list-none text-platform-muted">No data yet</li>
            )}
          </ul>
        </GlassCard>
      </div>

      {categoryScores.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Category breakdown</h2>
          <div className="space-y-3">
            {categoryScores.map((cat, i) => (
              <GlassCard key={i} className="!p-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium text-white">{cat.name}</p>
                  <span className="text-sm text-platform-accent">{cat.score}/100</span>
                </div>
                <div className="platform-progress">
                  <div
                    className="platform-progress-bar"
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
                <p className="text-xs text-platform-muted mt-2">{cat.comment}</p>
              </GlassCard>
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-wrap gap-3 pt-4">
        <Link href="/" className="platform-btn-ghost">
          Dashboard
        </Link>
        <Link href="/history" className="platform-btn-ghost">
          History
        </Link>
        {interviewId && (
          <Link href={`/interview/${interviewId}`} className="platform-btn-primary">
            Retake session
          </Link>
        )}
      </div>
    </div>
  );
}
