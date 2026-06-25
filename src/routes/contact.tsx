import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Phone, Mail, MessageCircle, MapPin, Clock } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { fetchContact } from "@/lib/contact";

export const Route = createFileRoute("/contact")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Contact — FixMyBengaluru" },
      {
        name: "description",
        content:
          "Get in touch with the FixMyBengaluru team for support, partnerships, or to escalate a critical road hazard.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { data: contact, isLoading } = useQuery({
    queryKey: ["site-contact"],
    queryFn: fetchContact,
  });

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="font-display text-2xl font-bold">Contact Us</h1>
        {contact?.description && (
          <p className="mt-1.5 text-sm text-muted-foreground">{contact.description}</p>
        )}

        {isLoading ? (
          <div className="grid place-items-center py-16 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            <ContactRow icon={<Phone className="size-5" />} label="Phone" value={contact?.phone} href={contact?.phone ? `tel:${contact.phone.replace(/\s/g, "")}` : undefined} />
            <ContactRow icon={<MessageCircle className="size-5" />} label="WhatsApp" value={contact?.whatsapp} href={contact?.whatsapp ? `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}` : undefined} />
            <ContactRow icon={<Mail className="size-5" />} label="Email" value={contact?.email} href={contact?.email ? `mailto:${contact.email}` : undefined} />
            <ContactRow icon={<MapPin className="size-5" />} label="Address" value={contact?.address} />
            <ContactRow icon={<Clock className="size-5" />} label="Hours" value={contact?.hours} />
          </div>
        )}
      </main>
    </div>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  href?: string;
}) {
  if (!value) return null;
  const content = (
    <div className="card-elevated flex items-center gap-3 p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate font-medium">{value}</p>
      </div>
    </div>
  );
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block hover:opacity-90">
      {content}
    </a>
  ) : (
    content
  );
}