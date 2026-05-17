import { cn } from "@/lib/utils";

export function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "muted";
}) {
  return (
    <span
      className={cn(
        "platform-badge",
        variant === "success" && "platform-badge-success",
        variant === "warning" && "platform-badge-warning",
        variant === "muted" && "platform-badge-muted"
      )}
    >
      {children}
    </span>
  );
}
