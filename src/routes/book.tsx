import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CalendarCheck2, Loader2, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useChatWidget } from "@/components/site/chat-context";
import { bookAppointment, fetchAvailability } from "@/lib/booking.functions";
import { DENTISTS, SERVICES } from "@/lib/clinic";

type Search = { service?: string | undefined; dentist?: string | undefined };

export const Route = createFileRoute("/book")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    service: typeof s["service"] === "string" ? s["service"] : undefined,
    dentist: typeof s["dentist"] === "string" ? s["dentist"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Book an Appointment — Sage Dental Studio" },
      { name: "description", content: "Choose a treatment, date and time and book your visit at Sage Dental Studio." },
      { property: "og:title", content: "Book an Appointment — Sage Dental Studio" },
      { property: "og:description", content: "Book your dental visit online in a minute." },
    ],
  }),
  component: BookPage,
});

const selectCls = "h-11 w-full rounded-md border border-input bg-card px-3 text-sm";

function BookPage() {
  const search = Route.useSearch();
  const { ask } = useChatWidget();
  const getSlots = useServerFn(fetchAvailability);
  const book = useServerFn(bookAppointment);

  const [service, setService] = useState(search.service ?? "");
  const [dentist, setDentist] = useState(search.dentist ?? "");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<{ start: string; time: string }[] | null>(null);
  const [slot, setSlot] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ reference: string; date: string; time: string; dentist: string; service: string } | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "", consent: false });
  const [minDate, setMinDate] = useState("");

  useEffect(() => setMinDate(new Date().toISOString().slice(0, 10)), []);

  const dentistOptions = DENTISTS.filter((d) => !service || d.services.includes(service));

  useEffect(() => {
    setSlot("");
    setSlots(null);
    if (!service || !date) return;
    let cancelled = false;
    setLoadingSlots(true);
    getSlots({ data: { serviceSlug: service, date, dentistSlug: dentist || null } })
      .then((r) => { if (!cancelled) { setSlots(r.slots); setError(r.error); } })
      .catch(() => !cancelled && setError("Couldn't load times. Please try again."))
      .finally(() => !cancelled && setLoadingSlots(false));
    return () => { cancelled = true; };
  }, [service, date, dentist, getSlots]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    if (!slot) return setError("Please choose a time.");
    if (form.name.trim().length < 2) return setError("Please enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError("Please enter a valid email.");
    if (form.phone.replace(/\D/g, "").length < 7) return setError("Please enter a valid phone number.");
    if (!form.consent) return setError("Please accept the privacy notice.");
    setSubmitting(true);
    try {
      const r = await book({ data: { serviceSlug: service, startIso: slot, dentistSlug: dentist || null, name: form.name, email: form.email, phone: form.phone, notes: form.notes || null } });
      if (r.ok) setDone(r);
      else setError(r.error);
    } catch {
      setError("Something went wrong. Please try again or call the clinic.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <section className="container-page max-w-xl py-24 text-center">
        <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground"><CalendarCheck2 className="size-7" /></div>
        <h1 className="mb-3 text-3xl font-semibold">Your appointment is confirmed</h1>
        <p className="mb-6 text-muted-foreground">{done.service} with {done.dentist} on {done.date} at {done.time}.</p>
        <p className="inline-block rounded-lg border border-border bg-card px-5 py-3 font-mono text-lg font-semibold">{done.reference}</p>
        <p className="mt-4 text-sm text-muted-foreground">Keep this reference to check or cancel your booking.</p>
      </section>
    );
  }

  return (
    <section className="container-page grid gap-12 py-16 md:py-24 lg:grid-cols-[1fr_1.4fr]">
      <div className="space-y-5">
        <p className="eyebrow">Book</p>
        <h1 className="text-4xl font-semibold md:text-5xl">Book your visit</h1>
        <p className="text-muted-foreground">Pick a treatment and a time that suits you. Only real, available times are shown.</p>
        <button onClick={() => ask("I'd like to book an appointment")} className="flex items-center gap-2 text-sm text-primary hover:underline">
          <MessageCircle className="size-4" /> Prefer to chat? Book with our assistant
        </button>
      </div>
      <form onSubmit={submit} className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-soft md:p-8" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="service">Treatment</Label>
            <select id="service" className={selectCls} value={service} onChange={(e) => { setService(e.target.value); setDentist(""); }} required>
              <option value="">Select a treatment</option>
              {SERVICES.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dentist">Dentist (optional)</Label>
            <select id="dentist" className={selectCls} value={dentist} onChange={(e) => setDentist(e.target.value)}>
              <option value="">Any available</option>
              {dentistOptions.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="date">Preferred date</Label>
            <Input id="date" type="date" min={minDate} value={date} onChange={(e) => setDate(e.target.value)} className="h-11" />
          </div>
        </div>

        {service && date && (
          <fieldset className="space-y-3">
            <legend className="mb-2 text-sm font-medium">Available times</legend>
            {loadingSlots ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Checking availability…</p>
            ) : slots && slots.length ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((s) => (
                  <button type="button" key={s.start} onClick={() => setSlot(s.start)} aria-pressed={slot === s.start}
                    className={`rounded-md border px-2 py-2 text-sm transition-colors ${slot === s.start ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`}>
                    {s.time}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No times available that day. Please try another date.</p>
            )}
          </fieldset>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2"><Label htmlFor="name">Full name</Label><Input id="name" className="h-11" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} autoComplete="name" /></div>
          <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" className="h-11" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} autoComplete="email" /></div>
          <div className="space-y-2"><Label htmlFor="phone">Phone</Label><Input id="phone" type="tel" className="h-11" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={20} autoComplete="tel" /></div>
          <div className="space-y-2 sm:col-span-2"><Label htmlFor="notes">Notes (optional)</Label><Textarea id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} maxLength={1000} /></div>
        </div>
        <label className="flex items-start gap-3 text-sm text-muted-foreground">
          <input type="checkbox" className="mt-1 size-4 accent-primary" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} />
          I agree that the clinic may use my details to manage this appointment, as described in the privacy notice.
        </label>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button type="submit" size="xl" className="w-full" disabled={submitting}>
          {submitting ? <><Loader2 className="size-4 animate-spin" /> Booking…</> : "Confirm appointment"}
        </Button>
      </form>
    </section>
  );
}
