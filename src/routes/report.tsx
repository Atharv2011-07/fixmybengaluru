import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  AlertTriangle,
  Camera,
  ImagePlus,
  Loader2,
  LocateFixed,
  Sparkles,
  X,
} from "lucide-react";
import { z } from "zod";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LocationPicker } from "@/components/map/MapView";
import { SeverityBadge } from "@/components/SeverityBadge";
import { analyzePothole, type PotholeAnalysis } from "@/lib/ai.functions";
import { createReport, uploadPotholeImages } from "@/lib/reports";
import { validateDescription } from "@/lib/moderation";
import { useAuth } from "@/lib/useAuth";
import {
  BENGALURU_AREAS,
  BENGALURU_AREA_COORDS,
  nearestArea,
  SEVERITY_CONFIG,
  SEVERITY_ORDER,
  type Severity,
  buildBbmpWhatsAppUrl,
} from "@/lib/constants";
import { incrementWspComplaintCount } from "@/lib/profileStats";

export const Route = createFileRoute("/report")({
  head: () => ({ meta: [{ title: "Report a Pothole — Pothole Bengaluru" }] }),
  component: ReportPage,
});

const schema = z.object({
  description: z
    .string()
    .trim()
    .min(10, "Add a short description (min 10 chars)")
    .max(1000)
    .refine((v) => validateDescription(v).ok, (v) => ({
      message: validateDescription(v).reason ?? "Please enter a valid description.",
    })),
});

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ReportPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const analyze = useServerFn(analyzePothole);

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [severity, setSeverity] = useState<Severity>("moderate");
  const [description, setDescription] = useState("");
  const [roadName, setRoadName] = useState("");
  const [landmark, setLandmark] = useState("");
  const [ward, setWard] = useState("");
  const [area, setArea] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [emergency, setEmergency] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [ai, setAi] = useState<PotholeAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const addFiles = async (incoming: FileList | null) => {
    if (!incoming?.length) return;
    const list = Array.from(incoming).slice(0, 5 - files.length);
    const newPreviews = await Promise.all(list.map(fileToDataUrl));
    setFiles((f) => [...f, ...list]);
    setPreviews((p) => [...p, ...newPreviews]);
    if (!ai && newPreviews[0]) runAnalysis(newPreviews[0]);
  };

  const runAnalysis = async (dataUrl: string) => {
    setAnalyzing(true);
    try {
      const result = await analyze({ data: { imageDataUrl: dataUrl } });
      setAi(result);
      if (!result.isPothole) {
        toast.error("Invalid image — no pothole detected. Please upload a clear photo of a pothole.");
        return;
      }
      setSeverity(result.severity);
      if (result.severity === "dangerous") setEmergency(true);
      toast.success("AI analysis complete");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  // Keep the selected area and the map pin in sync.
  const handleAreaChange = (a: string) => {
    setArea(a);
    const c = BENGALURU_AREA_COORDS[a];
    if (c) setCoords({ lat: c.lat, lng: c.lng });
  };

  const handlePinChange = (lat: number, lng: number) => {
    setCoords({ lat, lng });
    setArea(nearestArea(lat, lng));
  };

  const removeImage = (i: number) => {
    setFiles((f) => f.filter((_, idx) => idx !== i));
    setPreviews((p) => p.filter((_, idx) => idx !== i));
    if (i === 0) setAi(null);
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
        setArea(nearestArea(pos.coords.latitude, pos.coords.longitude));
        setLocating(false);
        toast.success("Location captured");
      },
      () => {
        setLocating(false);
        toast.error("Couldn't get your location. Tap the map to set it.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const submit = async () => {
    const parsed = schema.safeParse({ description });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    if (!coords) return toast.error("Please set the pothole location on the map");
    if (!user && !reporterName.trim()) return toast.error("Please add your name (or sign in)");
    if (files.length && ai && !ai.isPothole) {
      return toast.error("Invalid image — the uploaded photo isn't a pothole. Remove it or upload a valid pothole image.");
    }

    setSubmitting(true);
    try {
      const paths = files.length ? await uploadPotholeImages(files, user?.id ?? null) : [];
      const report = await createReport(
        {
          description: description.trim(),
          severity,
          ai_severity: ai?.severity ?? null,
          ai_analysis: ai ? `${ai.analysis} (Est. size: ${ai.sizeEstimate}, confidence ${(ai.confidence * 100).toFixed(0)}%)` : null,
          latitude: coords.lat,
          longitude: coords.lng,
          road_name: roadName.trim() || null,
          landmark: landmark.trim() || null,
          ward: ward.trim() || null,
          area: area || null,
          image_urls: paths,
          is_emergency: emergency,
          reporter_name: user ? null : reporterName.trim(),
        },
        user?.id ?? null,
      );
      // Reporting to BBMP on WhatsApp is compulsory — open it automatically.
      const waUrl = buildBbmpWhatsAppUrl(report);
      incrementWspComplaintCount();
      const win = window.open(waUrl, "_blank", "noopener,noreferrer");
      if (!win) {
        // Popup blocked — fall back to a direct navigation so WhatsApp still opens.
        window.location.href = waUrl;
      }
      toast.success(`Report submitted — ${report.complaint_id}. Send it on WhatsApp to complete.`);
      navigate({ to: "/reports/$id", params: { id: report.id } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="font-display text-2xl font-bold">Report a pothole</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a photo and location — our AI helps estimate severity automatically.
        </p>

        {/* Photos */}
        <Section title="Photos" subtitle="Up to 5 images. The first is analyzed by AI.">
          <div className="flex flex-wrap gap-2">
            {previews.map((src, i) => (
              <div key={i} className="relative size-24 overflow-hidden rounded-lg border border-border">
                <img src={src} alt={`Pothole ${i + 1}`} className="size-full object-cover" />
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
                  className="grid size-24 place-items-center rounded-lg border border-dashed border-border text-muted-foreground hover:border-accent hover:text-accent"
                >
                  <ImagePlus className="size-6" />
                </button>
                <button
                  type="button"
                  onClick={() => cameraRef.current?.click()}
                  className="grid size-24 place-items-center rounded-lg border border-dashed border-border text-muted-foreground hover:border-accent hover:text-accent"
                >
                  <Camera className="size-6" />
                </button>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden
            onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden
            onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />

          {analyzing && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-accent/10 p-3 text-sm text-accent">
              <Loader2 className="size-4 animate-spin" /> Analyzing image with AI…
            </div>
          )}
          {ai && !analyzing && !ai.isPothole && (
            <div className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
              <p className="flex items-center gap-1.5 font-semibold text-destructive">
                <AlertTriangle className="size-4" /> Invalid image
              </p>
              <p className="mt-1 text-foreground/90">
                No pothole detected in this photo. Please remove it and upload a clear image of an actual pothole.
              </p>
            </div>
          )}
          {ai && !analyzing && ai.isPothole && (
            <div className="mt-3 rounded-lg border border-accent/30 bg-accent/5 p-3 text-sm">
              <p className="flex items-center gap-1.5 font-semibold text-accent">
                <Sparkles className="size-4" /> AI analysis
              </p>
              <p className="mt-1 text-foreground/90">{ai.analysis}</p>
              <p className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                Suggested: <SeverityBadge severity={ai.severity} /> · Size {ai.sizeEstimate} · {(ai.confidence * 100).toFixed(0)}% confidence
              </p>
            </div>
          )}
        </Section>

        {/* Description + severity */}
        <Section title="Details">
          <div className="space-y-1.5">
            <Label htmlFor="desc">Description</Label>
            <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the pothole, its location on the road, and any danger it poses…" rows={3} />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Severity</Label>
              <Select value={severity} onValueChange={(v) => setSeverity(v as Severity)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="z-[1100]">
                  {SEVERITY_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>
                      {SEVERITY_CONFIG[s].label} — {SEVERITY_CONFIG[s].description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Area</Label>
              <Select value={area} onValueChange={handleAreaChange}>
                <SelectTrigger><SelectValue placeholder="Select area" /></SelectTrigger>
                <SelectContent className="z-[1100]">
                  {BENGALURU_AREAS.map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="size-4 text-destructive" />
              <span><strong>Emergency mode</strong> — extremely dangerous road condition</span>
            </div>
            <Switch checked={emergency} onCheckedChange={setEmergency} />
          </div>
        </Section>

        {/* Location */}
        <Section title="Location" subtitle="Tap the map to drop a pin, or use your current location.">
          <Button type="button" variant="outline" onClick={useMyLocation} disabled={locating} className="gap-1.5">
            {locating ? <Loader2 className="size-4 animate-spin" /> : <LocateFixed className="size-4" />}
            Use my location
          </Button>
          <div className="relative z-0 mt-3 h-64 overflow-hidden rounded-lg border border-border bg-background">
            <LocationPicker value={coords} onChange={handlePinChange} />
          </div>
          {coords && (
            <p className="mt-1.5 font-mono text-xs text-muted-foreground">
              📍 {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            </p>
          )}
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Road name" value={roadName} onChange={setRoadName} placeholder="e.g. 100 Feet Road" />
            <Field label="Landmark" value={landmark} onChange={setLandmark} placeholder="e.g. near Sony World signal" />
            <Field label="Ward number" value={ward} onChange={setWard} placeholder="e.g. 151" />
            {!user && <Field label="Your name" value={reporterName} onChange={setReporterName} placeholder="Reporting as guest" />}
          </div>
        </Section>

        <div className="sticky bottom-0 z-[70] -mx-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
          <Button onClick={submit} disabled={submitting} size="lg" className="w-full gap-2">
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Submit & report on WhatsApp
          </Button>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Reports are filed to BBMP via WhatsApp — hitting submit opens a pre-filled complaint. Just press send.
          </p>
        </div>
      </main>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="card-elevated mt-4 p-4">
      <h2 className="font-display text-base font-semibold">{title}</h2>
      {subtitle && <p className="mb-3 text-xs text-muted-foreground">{subtitle}</p>}
      {!subtitle && <div className="mb-3" />}
      {children}
    </section>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}