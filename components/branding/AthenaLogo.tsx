import Image from "next/image";
import { cn } from "@/lib/utils";
import { ATHENA_NAME, ATHENA_TAGLINE } from "@/lib/branding";

type AthenaLogoProps = {
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  className?: string;
  priority?: boolean;
};

const sizes = {
  sm: { width: 120, height: 40, text: "text-sm" },
  md: { width: 160, height: 48, text: "text-base" },
  lg: { width: 220, height: 64, text: "text-lg" },
  xl: { width: 280, height: 80, text: "text-xl" },
};

export function AthenaLogo({
  size = "md",
  showTagline = false,
  className,
  priority = false,
}: AthenaLogoProps) {
  const dim = sizes[size];

  return (
    <div className={cn("flex flex-col items-start gap-1", className)}>
      <Image
        src="/athena-logo.png"
        alt={`${ATHENA_NAME} — ${ATHENA_TAGLINE}`}
        width={dim.width}
        height={dim.height}
        className="h-auto w-auto max-w-full object-contain object-left"
        style={{ maxHeight: dim.height }}
        priority={priority}
      />
      {showTagline && (
        <p className={cn("text-platform-muted max-w-xs leading-snug", dim.text)}>
          {ATHENA_TAGLINE}
        </p>
      )}
    </div>
  );
}
