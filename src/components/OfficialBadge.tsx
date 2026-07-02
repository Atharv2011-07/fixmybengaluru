import { Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

export function OfficialBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary",
        className,
      )}
    >
      <Landmark className="size-3" /> Government / Official
    </span>
  );
}