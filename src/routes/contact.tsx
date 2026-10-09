import { createFileRoute, Link } from "@tanstack/react-router";
import { Accessibility, Clock, Mail, MapPin, Phone, Siren } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CLINIC } from "@/lib/clinic";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Visit Us — Sage Dental Studio, Bengaluru" },
      { name: "description", content: "Address, opening hours, directions and contact details for Sage Dental Studio." },
      { property: "og:title", content: "Visit Us — Sage Dental Studio" },
      { property: "og:description", content: "Find us on Lavelle Road, Bengaluru." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <section className="container-page py-16 md:py-24">
      <div className="mb-12 max-w-2xl space-y-4">
        <p className="eyebrow">Visit us</p>
        <h1 className="text-4xl font-semibold md:text-5xl">We'd love to see you</h1>
        <p className="text-sm text-muted-foreground">Clinic details shown are demo placeholders.</p>
      </div>
      <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-7">
          <Item icon={MapPin} title="Address">{CLINIC.address}<br /><a href={CLINIC.directions} target="_blank" rel="noreferrer" className="text-primary hover:underline">Get directions</a></Item>
          <Item icon={Phone} title="Phone"><a href={CLINIC.phoneHref} className="hover:text-foreground">{CLINIC.phone}</a></Item>
          <Item icon={Mail} title="Email"><a href={`mailto:${CLINIC.email}`} className="hover:text-foreground">{CLINIC.email}</a></Item>
          <Item icon={Clock} title="Opening hours">{CLINIC.hours.map((h) => <span key={h.days} className="block">{h.days}: {h.time}</span>)}</Item>
          <Item icon={Accessibility} title="Parking & access">{CLINIC.parking}</Item>
          <Item icon={Siren} title="Emergencies">{CLINIC.emergency}</Item>
          <Button asChild size="xl"><Link to="/book">Book an appointment</Link></Button>
        </div>
        <iframe title="Clinic location map" src={CLINIC.mapEmbed} className="h-[420px] w-full rounded-2xl border border-border lg:h-full" loading="lazy" />
      </div>
    </section>
  );
}

function Item({ icon: Icon, title, children }: { icon: typeof MapPin; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground"><Icon className="size-5" /></div>
      <div><h2 className="text-sm font-semibold">{title}</h2><p className="text-sm leading-relaxed text-muted-foreground">{children}</p></div>
    </div>
  );
}
