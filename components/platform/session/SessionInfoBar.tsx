import { Badge } from "@/components/platform/ui/Badge";

interface SessionInfoBarProps {
  title: string;
  subtitle?: string;
  statusLabel?: string;
  mode?: "interview" | "gd";
}

export function SessionInfoBar({
  title,
  subtitle,
  statusLabel,
  mode = "interview",
}: SessionInfoBarProps) {
  return (
    <header className="session-info-bar">
      <div>
        <Badge variant={mode === "gd" ? "success" : "default"}>
          {mode === "gd" ? "Group Discussion" : "Mock Interview"}
        </Badge>
        <h1 className="session-info-title">{title}</h1>
        {subtitle && <p className="session-info-subtitle">{subtitle}</p>}
      </div>
      {statusLabel && (
        <p className="session-info-status" role="status">
          {statusLabel}
        </p>
      )}
    </header>
  );
}
