import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const availSchema = z.object({
  serviceSlug: z.string().min(1).max(50),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dentistSlug: z.string().max(50).nullable(),
});

export const fetchAvailability = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => availSchema.parse(d))
  .handler(async ({ data }) => {
    const { getAvailability } = await import("./booking.server");
    const r = await getAvailability(data);
    return { error: "error" in r ? (r.error ?? null) : null, slots: "slots" in r ? (r.slots ?? []) : [] };
  });

const bookSchema = z.object({
  serviceSlug: z.string().min(1).max(50),
  startIso: z.string().min(10).max(40),
  dentistSlug: z.string().max(50).nullable(),
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(7).max(20),
  notes: z.string().max(1000).nullable(),
});

export const bookAppointment = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => bookSchema.parse(d))
  .handler(async ({ data }) => {
    const { createAppointment } = await import("./booking.server");
    const r = await createAppointment({ ...data, source: "web_form" });
    return r.ok ? { ok: true as const, reference: r.reference, date: r.date, time: r.time, dentist: r.dentist, service: r.service } : { ok: false as const, error: r.error };
  });
