import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Camera, CheckCircle2, ImagePlus, Loader2, LocateFixed, MapPin, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  fetchFixSubmissions,
  signImageUrls,
  submitFixVerification,
  uploadPotholeImages,
  type FixSubmission,
  type PotholeReport,
} from "@/lib/reports";
import { useAuth } from "@/lib/useAuth";
import { format } from "date-fns";

function haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function FixVerificationSection({ report }: { report: PotholeReport }) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");

  const { data: submissions = [] } = useQuery({
    queryKey: ["fixes", report.id],
    queryFn: () => fetchFixSubmissions(report.id),
  });

  const distance = coords ? haversineM(report.latitude, report.longitude, coords.lat, coords.lng) : null;
  const withinRange = distance !== null && distance <= 100;

  const addFiles = (incoming: FileList | null) => {
    if (!incoming?.length) return;
    const list = Array.from(incoming).slice(0, 5 - files.length);
    const urls = list.map((f) => URL.createObjectURL(f));
    setFiles((f) => [...f, ...list]);
    setPreviews((p) => [...p, ...urls]);
  };

  const removeImage = (i: number) => {
    setFiles((f) => f.filter((_, idx) => idx !== i));
    setPreviews((p) => p.filter((_, idx) => idx !== i));
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported on this device");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
        const d = haversineM(report.latitude, report.longitude, pos.coords.latitude, pos.coords.longitude);
        if (d <= 100) toast.success(`Location verified — you're ${d.toFixed(0)}m from the pothole`);
        else toast.warning(`You're ${d.toFixed(0)}m away — must be within 100m to auto-verify`);
      },
      () => {
        setLocating(false);
        toast.error("Couldn't get your location. Please allow location access.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const submit = async () => {
    if (!files.length) return toast.error("Please add at least one photo of the fixed pothole");
    if (!coords) return toast.error("Please share your location to verify the fix");
    if (!user && !name.trim()) return toast.error("Please add your name");
    setSubmitting(true);
    try {
      const paths = await uploadPotholeImages(files, user?.id ?? null);
      const row = await submitFixVerification({
        reportId: report.id,
        lat: coords.lat,
        lng: coords.lng,
        imagePaths: paths,
        submitterName: user ? "" : name.trim(),
      });
      if (row.verified) {
        toast.success("Fix verified! This report is now marked resolved.");
      } else {
        toast.info(`Fix submitted (${row.distance_m.toFixed(0)}m from pothole) — awaiting further verification.`);
      }
      setFiles([]);
      setPreviews([]);
      setCoords(null);
      setName("");
      qc.invalidateQueries({ queryKey: ["fixes", report.id] });
      qc.invalidateQueries({ queryKey: ["report", report.id] });
      qc.invalidateQueries({ queryKey: ["reports"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not submit fix");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card-elevated mt-4 p-4">
      <div className="flex items-center gap-1.5">
        <ShieldCheck className="size-4 text-accent" />
        <h2 className="font-display text-base font-semibold">Pothole fixed? Verify it</h2>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Upload a photo of the repaired road and share your location. If you're within 100m of the report, we auto-mark it resolved.
      </p>

      {report.status === "resolved" && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400">
          <CheckCircle2 className="size-4" /> This report is already marked resolved.
        </div>
      )}

      {/* Photos */}
      <div className="mt-3">
        <Label className="text-xs">Photos of the fixed road</Label>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {previews.map((src, i) => (
            <div key={i} className="relative size-20 overflow-hidden rounded-lg border border-border">
              <img src={src} alt={`Fix ${i + 1}`} className="size-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-background/90 text-foreground"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
          {files.length < 5 && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="grid size-20 place-items-center rounded-lg border border-dashed border-border text-muted-foreground hover:border-accent hover:text-accent"
              >
                <ImagePlus className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => cameraRef.current?.click()}
                className="grid size-20 place-items-center rounded-lg border border-dashed border-border text-muted-foreground hover:border-accent hover:text-accent"
              >
                <Camera className="size-5" />
              </button>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden
          onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden
          onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
      </div>

      {/* Location */}
      <div className="mt-3">
        <Label className="text-xs">Your current location</Label>
        <div className="mt-1.5 flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={useMyLocation} disabled={locating} className="gap-1.5">
            {locating ? <Loader2 className="size-4 animate-spin" /> : <LocateFixed className="size-4" />}
            Use my location
          </Button>
          {coords && distance !== null && (
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${withinRange ? "bg-green-500/15 text-green-700 dark:text-green-400" : "bg-amber-500/15 text-amber-700 dark:text-amber-400"}`}>
              <MapPin className="size-3" />
              {distance.toFixed(0)}m {withinRange ? "· in range" : "· too far"}
            </span>
          )}
        </div>
      </div>

      {!user && (
        <div className="mt-3">
          <Label className="text-xs">Your name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Reporting as guest" className="mt-1.5" />
        </div>
      )}

      <Button onClick={submit} disabled={submitting} className="mt-4 w-full gap-2">
        {submitting && <Loader2 className="size-4 animate-spin" />}
        Submit fix verification
      </Button>

      {submissions.length > 0 && (
        <div className="mt-5 border-t border-border pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Community verifications ({submissions.length})
          </p>
          <ul className="mt-2 space-y-2">
            {submissions.map((s) => (
              <FixRow key={s.id} sub={s} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function FixRow({ sub }: { sub: FixSubmission }) {
  const { data: imgs = [] } = useQuery({
    queryKey: ["fix-imgs", sub.id, sub.image_urls],
    queryFn: () => signImageUrls(sub.image_urls),
    enabled: sub.image_urls.length > 0,
  });
  return (
    <li className="rounded-lg border border-border bg-muted/30 p-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs">
          <span className="font-semibold">{sub.submitter_name || "Anonymous citizen"}</span>{" "}
          <span className="text-muted-foreground">· {format(new Date(sub.created_at), "d MMM, h:mm a")}</span>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${sub.verified ? "bg-green-500/15 text-green-700 dark:text-green-400" : "bg-muted text-muted-foreground"}`}>
          {sub.verified ? <CheckCircle2 className="size-3" /> : <MapPin className="size-3" />}
          {sub.verified ? "Verified" : `${sub.distance_m.toFixed(0)}m away`}
        </span>
      </div>
      {imgs.length > 0 && (
        <div className="mt-2 flex gap-1.5 overflow-x-auto">
          {imgs.map((src, i) => (
            <img key={i} src={src} alt={`Fix photo ${i + 1}`} className="h-24 w-auto shrink-0 rounded-md border border-border object-cover" />
          ))}
        </div>
      )}
    </li>
  );
}