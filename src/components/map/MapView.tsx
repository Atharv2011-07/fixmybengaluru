import { lazy, Suspense, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { PotholeReport } from "@/lib/reports";

const LeafletMap = lazy(() => import("./LeafletMap"));
const LeafletPicker = lazy(() => import("./LeafletPicker"));

function MapFallback() {
  return (
    <div className="grid h-full w-full place-items-center bg-muted text-muted-foreground">
      <Loader2 className="size-6 animate-spin" />
    </div>
  );
}

export function MapView({ reports }: { reports: PotholeReport[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <MapFallback />;
  return (
    <Suspense fallback={<MapFallback />}>
      <LeafletMap reports={reports} />
    </Suspense>
  );
}

export function LocationPicker({
  value,
  onChange,
}: {
  value: { lat: number; lng: number } | null;
  onChange: (lat: number, lng: number) => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <MapFallback />;
  return (
    <Suspense fallback={<MapFallback />}>
      <LeafletPicker value={value} onChange={onChange} />
    </Suspense>
  );
}