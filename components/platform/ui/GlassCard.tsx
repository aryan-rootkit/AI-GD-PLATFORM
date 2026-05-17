import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function GlassCard({
  children,
  className,
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn("platform-card", hover && "platform-card-hover", className)}
    >
      {children}
    </div>
  );
}
