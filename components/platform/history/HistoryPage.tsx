"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/platform/ui/GlassCard";
import { Badge } from "@/components/platform/ui/Badge";
import { recentSessions, type SessionType } from "@/lib/data/platform-mock";
import { cn } from "@/lib/utils";

interface HistoryItem {
  id: string;
  title: string;
  type: SessionType | string;
  score: number;
  duration: string;
  date: string;
  subject?: string;
}

interface HistoryPageProps {
  interviews?: Array<{
    id: string;
    role: string;
    type: string;
    createdAt?: string;
  }>;
}

export function HistoryPage({ interviews = [] }: HistoryPageProps) {
  const [typeFilter, setTypeFilter] = useState<"all" | SessionType>("all");
  const [subjectFilter, setSubjectFilter] = useState("all");

  const items: HistoryItem[] = useMemo(() => {
    const fromApi: HistoryItem[] = interviews.map((i) => ({
      id: i.id,
      title: `${i.role} Interview`,
      type: i.type?.toLowerCase().includes("gd") ? "gd" : "interview",
      score: 0,
      duration: "—",
      date: i.createdAt?.slice(0, 10) ?? "—",
      subject: i.role,
    }));
    const merged = [
      ...recentSessions.map((s) => ({
        id: s.id,
        title: s.title,
        type: s.type,
        score: s.score,
        duration: s.duration,
        date: s.date,
        subject: s.title.split("—")[0]?.trim(),
      })),
      ...fromApi,
    ];
    return merged;
  }, [interviews]);

  const subjects = useMemo(
    () => ["all", ...new Set(items.map((i) => i.subject).filter(Boolean) as string[])],
    [items]
  );

  const filtered = items.filter((item) => {
    if (typeFilter !== "all" && item.type !== typeFilter) return false;
    if (subjectFilter !== "all" && item.subject !== subjectFilter) return false;
    return true;
  });

  const avgScore =
    filtered.filter((i) => i.score > 0).reduce((a, b) => a + b.score, 0) /
      (filtered.filter((i) => i.score > 0).length || 1) || 0;

  return (
    <div className="platform-page space-y-8">
      <header>
        <p className="platform-eyebrow">Progress</p>
        <h1 className="platform-title">Session history</h1>
        <p className="platform-subtitle">
          Track measurable growth across interviews and group discussions.
        </p>
      </header>

      <div className="grid sm:grid-cols-3 gap-4">
        <GlassCard className="!p-5 text-center">
          <p className="text-xs text-platform-muted">Sessions</p>
          <p className="text-2xl font-semibold text-white mt-1">{filtered.length}</p>
        </GlassCard>
        <GlassCard className="!p-5 text-center">
          <p className="text-xs text-platform-muted">Avg score</p>
          <p className="text-2xl font-semibold text-white mt-1">
            {Math.round(avgScore)}%
          </p>
        </GlassCard>
        <GlassCard className="!p-5 text-center">
          <p className="text-xs text-platform-muted">Trend</p>
          <p className="text-2xl font-semibold text-platform-accent mt-1">↑ 8%</p>
        </GlassCard>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "interview", "gd"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTypeFilter(t)}
            className={cn("history-filter", typeFilter === t && "history-filter-active")}
          >
            {t === "all" ? "All" : t === "interview" ? "Interviews" : "GD"}
          </button>
        ))}
        <select
          className="history-select"
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
        >
          {subjects.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All subjects" : s}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map((item) => (
          <GlassCard
            key={item.id}
            hover
            className="!p-4 flex flex-wrap gap-4 justify-between items-center"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-white">{item.title}</p>
                <Badge variant={item.type === "gd" ? "success" : "muted"}>
                  {item.type === "gd" ? "GD" : "Interview"}
                </Badge>
              </div>
              <p className="text-xs text-platform-muted mt-1">{item.date}</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              {item.score > 0 && (
                <span className="text-platform-accent font-medium">{item.score}%</span>
              )}
              <span className="text-platform-muted">{item.duration}</span>
              {item.id.startsWith("s") ? (
                <span className="text-xs text-platform-muted">Preview</span>
              ) : (
                <Link
                  href={`/interview/${item.id}/feedback`}
                  className="text-xs text-platform-accent hover:underline"
                >
                  Analytics
                </Link>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
