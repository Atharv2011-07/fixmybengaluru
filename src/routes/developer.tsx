import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, ShieldAlert, Trash2, ArrowUp, Lock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { fetchReports } from "@/lib/reports";
import { deleteReportAdmin } from "@/lib/admin.functions";
import { fetchContact } from "@/lib/contact";
import { updateContactAdmin } from "@/lib/contact.functions";
import { useAuth } from "@/lib/useAuth";
import { useIsAdmin } from "@/lib/useIsAdmin";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/developer")({
  ssr: false,
  head: () => ({ meta: [{ title: "Developer Zone — Pothole Bengaluru" }] }),
  component: DeveloperZone,
});

function Gate({ icon, title, message, action }: { icon: React.ReactNode; title: string; message: string; action?: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          {icon}
        </div>
        <h1 className="mt-4 font-display text-xl font-bold">{title}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{message}</p>
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
}

function DeveloperZone() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();

  if (authLoading || (user && adminLoading)) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="grid place-items-center py-24 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Gate
        icon={<Lock className="size-7" />}
        title="Sign in required"
        message="The Developer Zone is restricted. Please sign in with your authorized account."
        action={<Button asChild><Link to="/auth">Sign in</Link></Button>}
      />
    );
  }

  if (!isAdmin) {
    return (
      <Gate
        icon={<ShieldAlert className="size-7" />}
        title="Access denied"
        message="This area is reserved for developers only. Your account does not have access."
        action={<Button asChild variant="outline"><Link to="/">Back to map</Link></Button>}
      />
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const qc = useQueryClient();
  const del = useServerFn(deleteReportAdmin);
  const [deleting, setDeleting] = useState<string | null>(null);

  const { data: reports = [], isLoading } = useQuery({ queryKey: ["reports"], queryFn: fetchReports });

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await del({ data: { reportId: id } });
      toast.success("Report deleted");
      qc.invalidateQueries({ queryKey: ["reports"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete report");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="flex items-center gap-2">
          <ShieldAlert className="size-5 text-accent" />
          <h1 className="font-display text-2xl font-bold">Developer Zone</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Admin-only controls. Permanently delete pothole reports — {reports.length} total.
        </p>

        <ContactEditor />

        {isLoading ? (
          <div className="grid place-items-center py-16 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">No reports to manage.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {reports.map((r) => (
              <li key={r.id} className="card-elevated flex flex-wrap items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="font-mono text-xs text-muted-foreground">{r.complaint_id}</p>
                  <Link to="/reports/$id" params={{ id: r.id }} className="block truncate font-medium hover:underline">
                    {r.road_name || r.area || "Pothole report"}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <SeverityBadge severity={r.severity} />
                    <StatusBadge status={r.status} />
                    <span className="inline-flex items-center gap-0.5"><ArrowUp className="size-3" />{r.upvotes}</span>
                    <span>· {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="gap-1.5" disabled={deleting === r.id}>
                      {deleting === r.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="z-[1200]">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this report?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {r.complaint_id} will be permanently removed, including its photos, votes and history. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(r.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

function ContactEditor() {
  const qc = useQueryClient();
  const update = useServerFn(updateContactAdmin);
  const { data: contact, isLoading } = useQuery({ queryKey: ["site-contact"], queryFn: fetchContact });

  const [form, setForm] = useState({
    phone: "",
    email: "",
    whatsapp: "",
    address: "",
    hours: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  if (contact && !hydrated) {
    setForm({
      phone: contact.phone ?? "",
      email: contact.email ?? "",
      whatsapp: contact.whatsapp ?? "",
      address: contact.address ?? "",
      hours: contact.hours ?? "",
      description: contact.description ?? "",
    });
    setHydrated(true);
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      await update({ data: form });
      toast.success("Contact info updated");
      qc.invalidateQueries({ queryKey: ["site-contact"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update contact info");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="card-elevated mt-6 p-4">
      <h2 className="font-display text-lg font-bold">Contact Panel</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">
        Edit the public contact details shown on the Contact page.
      </p>
      {isLoading ? (
        <div className="grid place-items-center py-8 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Phone"><Input value={form.phone} onChange={set("phone")} /></Field>
          <Field label="WhatsApp"><Input value={form.whatsapp} onChange={set("whatsapp")} /></Field>
          <Field label="Email"><Input value={form.email} onChange={set("email")} /></Field>
          <Field label="Hours"><Input value={form.hours} onChange={set("hours")} /></Field>
          <div className="sm:col-span-2">
            <Field label="Address"><Input value={form.address} onChange={set("address")} /></Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Description"><Textarea value={form.description} onChange={set("description")} rows={3} /></Field>
          </div>
          <div className="sm:col-span-2">
            <Button onClick={save} disabled={saving} className="gap-1.5">
              {saving && <Loader2 className="size-4 animate-spin" />}
              Save contact info
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}