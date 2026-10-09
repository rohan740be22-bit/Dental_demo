// Server-only booking service. All availability and reservations go through here.
const OFFSET_MIN = 330; // Asia/Kolkata, UTC+5:30, no DST

type Admin = Awaited<typeof import("@/integrations/supabase/client.server")>["supabaseAdmin"];
async function db(): Promise<Admin> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function localToUtc(date: string, minutes: number) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, minutes - OFFSET_MIN));
}
export function formatLocal(iso: string) {
  const d = new Date(new Date(iso).getTime() + OFFSET_MIN * 60000);
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let h = d.getUTCHours();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return {
    date: `${days[d.getUTCDay()]}, ${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`,
    time: `${h}:${mm} ${ampm}`,
  };
}
export function todayLocal() {
  const d = new Date(Date.now() + OFFSET_MIN * 60000);
  return { iso: d.toISOString().slice(0, 10), weekday: d.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" }) };
}

function openingWindows(date: string): [number, number][] {
  const [y, m, d] = date.split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  if (dow === 0) return [];
  if (dow === 6) return [[9 * 60, 14 * 60]];
  return [
    [9 * 60, 13 * 60],
    [14 * 60, 18 * 60],
  ];
}

export async function getAvailability(input: { serviceSlug: string; date: string; dentistSlug?: string | null }) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) return { error: "Date must be YYYY-MM-DD." };
  const sb = await db();
  const { data: service } = await sb.from("services").select("*").eq("slug", input.serviceSlug).maybeSingle();
  if (!service) return { error: `Unknown service '${input.serviceSlug}'.` };
  let dq = sb.from("dentists").select("id,slug,name,service_slugs").contains("service_slugs", [service.slug]);
  if (input.dentistSlug) dq = dq.eq("slug", input.dentistSlug);
  const { data: dentists } = await dq;
  if (!dentists?.length) return { error: "No dentist offers this service with those preferences." };

  const windows = openingWindows(input.date);
  if (!windows.length) return { date: input.date, closed: true, slots: [] };

  const dayStart = localToUtc(input.date, 0).toISOString();
  const dayEnd = localToUtc(input.date, 24 * 60).toISOString();
  const { data: booked } = await sb
    .from("appointments")
    .select("dentist_id,start_at,end_at")
    .neq("status", "cancelled")
    .lt("start_at", dayEnd)
    .gt("end_at", dayStart)
    .in("dentist_id", dentists.map((d) => d.id));

  const minStart = Date.now() + 60 * 60000;
  const slots: { start: string; time: string; dentists: string[] }[] = [];
  for (const [open, close] of windows) {
    for (let t = open; t + service.duration_minutes <= close; t += 30) {
      const s = localToUtc(input.date, t);
      const e = new Date(s.getTime() + service.duration_minutes * 60000);
      if (s.getTime() < minStart) continue;
      const free = dentists.filter(
        (d) =>
          !booked?.some(
            (b) => b.dentist_id === d.id && new Date(b.start_at) < e && new Date(b.end_at) > s,
          ),
      );
      if (free.length) slots.push({ start: s.toISOString(), time: formatLocal(s.toISOString()).time, dentists: free.map((d) => d.name) });
    }
  }
  return { date: input.date, service: service.name, durationMinutes: service.duration_minutes, slots };
}

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isPhone = (v: string) => /^[+\d][\d\s-]{6,18}$/.test(v);

export async function createAppointment(input: {
  serviceSlug: string;
  startIso: string;
  dentistSlug?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  source: "chat" | "web_form";
}) {
  const name = input.name?.trim();
  const email = input.email?.trim() || null;
  const phone = input.phone?.trim() || null;
  if (!name || name.length < 2) return { ok: false as const, error: "Patient name is required." };
  if (!email && !phone) return { ok: false as const, error: "An email or phone number is required." };
  if (email && !isEmail(email)) return { ok: false as const, error: "Email address looks invalid." };
  if (phone && !isPhone(phone)) return { ok: false as const, error: "Phone number looks invalid." };
  const start = new Date(input.startIso);
  if (isNaN(start.getTime())) return { ok: false as const, error: "Invalid start time." };

  const localDate = new Date(start.getTime() + OFFSET_MIN * 60000).toISOString().slice(0, 10);
  const avail = await getAvailability({ serviceSlug: input.serviceSlug, date: localDate, dentistSlug: input.dentistSlug });
  if ("error" in avail && avail.error) return { ok: false as const, error: avail.error };
  const slot = avail.slots?.find((s) => s.start === start.toISOString());
  if (!slot) return { ok: false as const, error: "That time is no longer available. Please choose another slot." };

  const sb = await db();
  const { data: service } = await sb.from("services").select("*").eq("slug", input.serviceSlug).single();
  const { data: dentists } = await sb.from("dentists").select("id,name").in("name", slot.dentists).order("sort_order");
  const end = new Date(start.getTime() + service!.duration_minutes * 60000);

  for (const dentist of dentists ?? []) {
    const reference = "SD-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    const { error } = await sb.from("appointments").insert({
      booking_reference: reference,
      patient_name: name,
      patient_email: email,
      patient_phone: phone,
      service_id: service!.id,
      dentist_id: dentist.id,
      start_at: start.toISOString(),
      end_at: end.toISOString(),
      status: "confirmed",
      source: input.source,
      notes: input.notes?.slice(0, 1000) || null,
    });
    if (!error) {
      const f = formatLocal(start.toISOString());
      return { ok: true as const, reference, service: service!.name, dentist: dentist.name, date: f.date, time: f.time, name, status: "confirmed" };
    }
    if (error.code !== "23P01") {
      console.error("Booking insert failed", error);
      return { ok: false as const, error: "We couldn't save the booking. Please try again or call the clinic." };
    }
  }
  return { ok: false as const, error: "That time was just taken. Please choose another slot." };
}

async function findBooking(reference: string, contact: string) {
  const sb = await db();
  const { data } = await sb
    .from("appointments")
    .select("id,booking_reference,patient_name,patient_email,patient_phone,start_at,status,services(name),dentists(name)")
    .eq("booking_reference", reference.trim().toUpperCase())
    .maybeSingle();
  if (!data) return null;
  const c = contact.trim().toLowerCase().replace(/\s|-/g, "");
  const match =
    (data.patient_email && data.patient_email.toLowerCase() === c) ||
    (data.patient_phone && data.patient_phone.replace(/\s|-/g, "") === c);
  return match ? data : null;
}

export async function getBookingStatus(reference: string, contact: string) {
  const b = await findBooking(reference, contact);
  if (!b) return { ok: false, error: "No booking matches that reference and contact detail." };
  const f = formatLocal(b.start_at);
  return { ok: true, reference: b.booking_reference, status: b.status, service: b.services?.name, dentist: b.dentists?.name, date: f.date, time: f.time };
}

export async function cancelAppointment(reference: string, contact: string) {
  const b = await findBooking(reference, contact);
  if (!b) return { ok: false, error: "No booking matches that reference and contact detail." };
  if (b.status === "cancelled") return { ok: false, error: "This booking is already cancelled." };
  const sb = await db();
  const { error } = await sb.from("appointments").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("id", b.id);
  if (error) return { ok: false, error: "Cancellation failed. Please call the clinic." };
  return { ok: true, reference: b.booking_reference, status: "cancelled" };
}
