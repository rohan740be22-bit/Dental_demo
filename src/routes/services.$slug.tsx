import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useChatWidget } from "@/components/site/chat-context";
import { DENTISTS, SERVICES } from "@/lib/clinic";

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => {
    const service = SERVICES.find((s) => s.slug === params.slug);
    if (!service) throw notFound();
    return { service };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] };
    const s = loaderData.service;
    return {
      meta: [
        { title: `${s.name} — Sage Dental Studio` },
        { name: "description", content: s.summary },
        { property: "og:title", content: `${s.name} — Sage Dental Studio` },
        { property: "og:description", content: s.summary },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="text-2xl font-semibold">Treatment not found</h1>
      <Link to="/services" className="mt-4 inline-block text-primary">See all services</Link>
    </div>
  ),
  component: ServiceDetail,
});

function ServiceDetail() {
  const { service: s } = Route.useLoaderData();
  const { ask } = useChatWidget();
  const dentists = DENTISTS.filter((d) => d.services.includes(s.slug));
  const related = SERVICES.filter((x) => x.slug !== s.slug).slice(0, 3);
  return (
    <article className="container-page py-16 md:py-24">
      <Link to="/services" className="text-sm text-muted-foreground hover:text-foreground">← All services</Link>
      <div className="mt-6 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-12">
          <header className="space-y-4">
            <h1 className="text-4xl font-semibold md:text-5xl">{s.name}</h1>
            <p className="text-lg text-muted-foreground">{s.summary}</p>
          </header>
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Why patients come in</h2>
            <ul className="space-y-2">{s.reasons.map((r) => <li key={r} className="flex gap-3"><Check className="mt-0.5 size-5 text-primary" />{r}</li>)}</ul>
          </section>
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">What to expect</h2>
            <ol className="space-y-3">{s.expect.map((e, i) => <li key={e} className="flex gap-3"><span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">{i + 1}</span>{e}</li>)}</ol>
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Aftercare</h2>
            <p className="text-muted-foreground">{s.aftercare}</p>
          </section>
          <section>
            <h2 className="mb-2 text-xl font-semibold">Questions</h2>
            <Accordion type="single" collapsible>
              {s.faqs.map((f) => (
                <AccordionItem key={f.q} value={f.q}><AccordionTrigger className="text-left">{f.q}</AccordionTrigger><AccordionContent className="text-muted-foreground">{f.a}</AccordionContent></AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-soft">
            <p className="text-sm text-muted-foreground">Typical appointment: {s.duration} minutes</p>
            <Button asChild size="xl" className="w-full"><Link to="/book" search={{ service: s.slug }}>Book this treatment</Link></Button>
            <Button size="xl" variant="outline" className="w-full" onClick={() => ask(`I'd like to book ${s.name}`)}>Book via chat</Button>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-sm font-semibold">Dentists offering this</h2>
            <ul className="space-y-3">
              {dentists.map((d) => (
                <li key={d.slug} className="flex items-center gap-3">
                  <img src={d.photo} alt="" loading="lazy" width={40} height={40} className="size-10 rounded-full object-cover object-top" />
                  <div><p className="text-sm font-medium">{d.name}</p><p className="text-xs text-muted-foreground">{d.specialization}</p></div>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-3 text-sm font-semibold">Related treatments</h2>
            <ul className="space-y-2 text-sm">{related.map((r) => <li key={r.slug}><Link to="/services/$slug" params={{ slug: r.slug }} className="text-primary hover:underline">{r.name}</Link></li>)}</ul>
          </div>
        </aside>
      </div>
    </article>
  );
}
