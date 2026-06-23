import { useEffect, useState } from "react";
import { MapPin, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "pb-location-pref";

/**
 * Friendly, dismissible prompt shown right after landing on the site asking the
 * visitor to enable location so reports can be pinned accurately. Remembers the
 * choice so it never nags.
 */
export function LocationBanner() {
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const pref = window.localStorage.getItem(STORAGE_KEY);
    if (pref) return;
    // Small delay so it eases in after the page settles.
    const t = setTimeout(() => setShow(true), 600);
    return () => clearTimeout(t);
  }, []);

  const remember = (value: string) => {
    window.localStorage.setItem(STORAGE_KEY, value);
    setShow(false);
  };

  const enable = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported on this device");
      remember("unsupported");
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        window.localStorage.setItem(
          "pb-last-coords",
          JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        );
        setBusy(false);
        toast.success("Location enabled — reports will be pinned near you");
        remember("granted");
      },
      () => {
        setBusy(false);
        toast.info("No problem — you can still drop a pin on the map");
        remember("denied");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  if (!show) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[1200] mx-auto max-w-md animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-start gap-3 rounded-2xl border border-border bg-card/95 p-4 shadow-[var(--shadow-float)] backdrop-blur-xl">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent">
          <MapPin className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Enable location?</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            We use your location to pin potholes accurately and show issues near you.
          </p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={enable} disabled={busy} className="gap-1.5">
              {busy && <Loader2 className="size-3.5 animate-spin" />} Enable
            </Button>
            <Button size="sm" variant="ghost" onClick={() => remember("dismissed")}>
              Not now
            </Button>
          </div>
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => remember("dismissed")}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}