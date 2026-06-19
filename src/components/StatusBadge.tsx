import { cn } from "@/lib/utils";
import { STATUS_CONFIG, type ReportStatus } from "@/lib/constants";

export function StatusBadge({ status, className }: { status: ReportStatus; className?: string }) {
  const c = STATUS_CONFIG[status];
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