import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock } from "lucide-react";
import { SERVICES } from "@/lib/clinic";

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "Dental Services — Sage Dental Studio" },
      { name: "description", content: "Cleaning, whitening, implants, aligners, root canal, pediatric and emergency dentistry in Bengaluru." },
      { property: "og:title", content: "Dental Services — Sage Dental Studio" },
      { property: "og:description", content: "Explore the treatments offered at Sage Dental Studio." },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <section className="container-page py-16 md:py-24">
      <div className="mb-12 max-w-2xl space-y-4">
        <p className="eyebrow">Services</p>
        <h1 className="text-4xl font-semibold md:text-5xl">Treatments, explained simply</h1>
        <p className="text-lg text-muted-foreground">From routine check-ups to smile makeovers. Pricing is shared after your assessment.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s) => (
          <Link key={s.slug} to="/services/$slug" params={{ slug: s.slug }} className="group flex flex-col rounded-xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-soft">
            <h2 className="mb-2 text-lg font-semibold">{s.name}</h2>
            <p className="mb-6 flex-1 text-sm leading-relaxed text-muted-foreground">{s.summary}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground"><Clock className="size-4" /> {s.duration} min</span>
              <span className="flex items-center gap-1 text-primary">Details <ArrowRight className="size-4" /></span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
