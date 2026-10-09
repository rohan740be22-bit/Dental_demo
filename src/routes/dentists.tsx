import { createFileRoute, Link } from "@tanstack/react-router";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DENTISTS, SERVICES } from "@/lib/clinic";

export const Route = createFileRoute("/dentists")({
  head: () => ({
    meta: [
      { title: "Our Dentists — Sage Dental Studio" },
      { name: "description", content: "Meet the dentists at Sage Dental Studio: implants, orthodontics, general and pediatric care." },
      { property: "og:title", content: "Our Dentists — Sage Dental Studio" },
      { property: "og:description", content: "Meet the team behind Sage Dental Studio." },
    ],
  }),
  component: DentistsPage,
});

function DentistsPage() {
  return (
    <section className="container-page py-16 md:py-24">
      <div className="mb-12 max-w-2xl space-y-4">
        <p className="eyebrow">Our team</p>
        <h1 className="text-4xl font-semibold md:text-5xl">Meet the dentists</h1>
        <p className="text-sm text-muted-foreground">Profiles and qualifications are demo content and must be verified before launch.</p>
      </div>
      <div className="space-y-6">
        {DENTISTS.map((d) => (
          <article key={d.slug} id={d.slug} className="grid overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-[280px_1fr]">
            <img src={d.photo} alt={d.name} loading="lazy" width={800} height={1008} className="aspect-square h-full w-full object-cover object-top md:aspect-auto" />
            <div className="space-y-4 p-7">
              <div>
                <h2 className="text-2xl font-semibold">{d.name}</h2>
                <p className="text-sm text-muted-foreground">{d.title} · {d.specialization}</p>
              </div>
              <p className="leading-relaxed">{d.bio}</p>
              <p className="flex items-center gap-2 text-sm text-muted-foreground"><Languages className="size-4" /> {d.languages.join(", ")}</p>
              <div className="flex flex-wrap gap-2">
                {d.services.map((slug) => (
                  <span key={slug} className="rounded-full bg-secondary px-3 py-1 text-xs">{SERVICES.find((s) => s.slug === slug)?.name}</span>
                ))}
              </div>
              <Button asChild className="rounded-full"><Link to="/book" search={{ dentist: d.slug }}>Book with {d.name.split(" ")[1]}</Link></Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
