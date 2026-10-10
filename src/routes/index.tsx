import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, HeartHandshake, MapPin, MessageCircle, ShieldCheck, Sparkles as _s, Star, Stethoscope } from "lucide-react";
import hero from "@/assets/hero-clinic.jpg";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useChatWidget } from "@/components/site/chat-context";
import { CLINIC, DENTISTS, FAQS, SERVICES } from "@/lib/clinic";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sage Dental Studio — A Healthier Smile Starts Here" },
      { name: "description", content: "Personalised dental care in a calm, modern Bengaluru clinic. Book your appointment online or chat with our assistant." },
      { property: "og:title", content: "Sage Dental Studio — A Healthier Smile Starts Here" },
      { property: "og:description", content: "Personalised dental care in a calm, modern clinic. Book in minutes." },
    ],
  }),
  component: Home,
});

const WHY = [
  { icon: HeartHandshake, title: "Unhurried appointments", text: "Time to listen, explain and plan together." },
  { icon: ShieldCheck, title: "Clear guidance", text: "Options and estimates shared before any treatment." },
  { icon: Stethoscope, title: "Modern equipment", text: "Comfortable, precise care in a calm space." },
  { icon: Clock, title: "Easy booking", text: "Book online or with our assistant, any time of day." },
];

const TESTIMONIALS = [
  { quote: "The team explained every step and I never felt rushed.", name: "Demo patient A" },
  { quote: "Booking through the chat took two minutes. Lovely clinic.", name: "Demo patient B" },
  { quote: "My daughter actually looks forward to her check-ups now.", name: "Demo patient C" },
];

function Home() {
  const { ask } = useChatWidget();
  return (
    <>
      {/* Hero */}
      <section className="container-page grid items-center gap-12 py-14 md:grid-cols-[1.05fr_1fr] md:py-24">
        <div className="animate-fade-up space-y-7">
          <p className="eyebrow">{CLINIC.tagline} · {CLINIC.city}</p>
          <h1 className="text-4xl font-semibold leading-[1.05] md:text-6xl">A healthier smile starts here.</h1>
          <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
            Personalised dental care in a comfortable, modern environment. Discover thoughtful treatment, clear guidance, and care designed around you.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="xl"><Link to="/book" search={{}}>Book an appointment</Link></Button>
            <Button asChild size="xl" variant="outline"><Link to="/services">Explore our services</Link></Button>
          </div>
          <button onClick={() => ask("I'd like to book an appointment")} className="flex items-center gap-2 text-sm text-primary hover:underline">
            <MessageCircle className="size-4" /> Or book in a quick chat with our assistant
          </button>
        </div>
        <div className="relative">
          <img src={hero} alt="Bright, calm treatment room at Sage Dental Studio" width={1600} height={1104} className="aspect-[4/3.4] w-full rounded-2xl object-cover shadow-lift" />
          <div className="absolute -bottom-5 left-5 rounded-xl border border-border bg-card px-4 py-3 shadow-soft">
            <p className="text-xs text-muted-foreground">Open today</p>
            <p className="text-sm font-semibold">9:00 AM – 6:00 PM</p>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="border-y border-border bg-secondary">
        <div className="container-page grid grid-cols-2 gap-6 py-8 text-center md:grid-cols-4">
          {[["3", "Dentists"], ["9", "Treatments"], ["6 days", "Open weekly"], ["24/7", "Online booking"]].map(([n, l]) => (
            <div key={l}><p className="font-display text-2xl font-semibold">{n}</p><p className="text-sm text-muted-foreground">{l}</p></div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="container-page py-20">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div className="space-y-3">
            <p className="eyebrow">Treatments</p>
            <h2 className="text-3xl font-semibold md:text-4xl">Care for every smile</h2>
          </div>
          <Link to="/services" className="hidden items-center gap-1 text-sm text-primary hover:underline md:flex">All services <ArrowRight className="size-4" /></Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.slice(0, 6).map((s) => (
            <Link key={s.slug} to="/services/$slug" params={{ slug: s.slug }} className="group rounded-xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-soft">
              <h3 className="mb-2 text-lg font-semibold">{s.name}</h3>
              <p className="mb-5 text-sm leading-relaxed text-muted-foreground">{s.summary}</p>
              <span className="flex items-center gap-1 text-sm text-primary">Learn more <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></span>
            </Link>
          ))}
        </div>
      </section>

      {/* Dentists */}
      <section className="bg-secondary py-20">
        <div className="container-page">
          <div className="mb-10 space-y-3">
            <p className="eyebrow">Our team</p>
            <h2 className="text-3xl font-semibold md:text-4xl">Meet the dentists</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {DENTISTS.map((d) => (
              <div key={d.slug} className="overflow-hidden rounded-xl border border-border bg-card">
                <img src={d.photo} alt={d.name} loading="lazy" width={800} height={1008} className="aspect-[4/4.2] w-full object-cover object-top" />
                <div className="p-5">
                  <h3 className="font-semibold">{d.name}</h3>
                  <p className="text-sm text-muted-foreground">{d.specialization}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="container-page py-20">
        <div className="mb-10 space-y-3">
          <p className="eyebrow">Why patients choose us</p>
          <h2 className="max-w-xl text-3xl font-semibold md:text-4xl">Dentistry that feels considered</h2>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {WHY.map((w) => (
            <div key={w.title} className="space-y-3">
              <div className="flex size-11 items-center justify-center rounded-lg bg-accent text-accent-foreground"><w.icon className="size-5" /></div>
              <h3 className="font-semibold">{w.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{w.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-beige/50 py-20">
        <div className="container-page">
          <div className="mb-10 space-y-3">
            <p className="eyebrow">Patient stories</p>
            <h2 className="text-3xl font-semibold md:text-4xl">Kind words</h2>
            <p className="text-sm text-muted-foreground">Demo testimonials — replace with verified patient feedback before launch.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="rounded-xl border border-border bg-card p-6">
                <div className="mb-4 flex gap-0.5 text-primary">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-current" />)}</div>
                <blockquote className="mb-4 leading-relaxed">“{t.quote}”</blockquote>
                <figcaption className="text-sm text-muted-foreground">{t.name}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-page grid gap-10 py-20 md:grid-cols-[1fr_1.4fr]">
        <div className="space-y-3">
          <p className="eyebrow">FAQ</p>
          <h2 className="text-3xl font-semibold md:text-4xl">Good to know</h2>
        </div>
        <Accordion type="single" collapsible>
          {FAQS.map((f) => (
            <AccordionItem key={f.q} value={f.q}>
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* CTA */}
      <section className="container-page pb-20">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-primary p-10 text-primary-foreground md:flex-row md:items-center md:p-14">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold">Ready when you are.</h2>
            <p className="flex items-center gap-2 opacity-80"><MapPin className="size-4" /> {CLINIC.address}</p>
          </div>
          <Button asChild size="xl" variant="secondary"><Link to="/book" search={{}}>Book an appointment</Link></Button>
        </div>
      </section>
    </>
  );
}
