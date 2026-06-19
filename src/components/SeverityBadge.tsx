import { cn } from "@/lib/utils";
import { SEVERITY_CONFIG, type Severity } from "@/lib/constants";

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  const c = SEVERITY_CONFIG[severity];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        c.badge,
        className,
      )}
    >
      {c.label}
    </span>
  );
}