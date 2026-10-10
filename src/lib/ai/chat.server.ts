import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from "ai";
import { z } from "zod";
import { CLINIC, DENTISTS, SERVICES } from "@/lib/clinic";
import {
  cancelAppointment,
  createAppointment,
  getAvailability,
  getBookingStatus,
  todayLocal,
} from "@/lib/booking.server";
import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id.server";

const MODEL = "openai/gpt-6-astra";

function instructions() {
  const t = todayLocal();
  return `You are the friendly booking assistant for ${CLINIC.name}, a dental clinic in ${CLINIC.city}.
Today is ${t.weekday}, ${t.iso} (clinic timezone ${CLINIC.timezone}).

Your job: answer general clinic questions and book appointments end-to-end in conversation.

Rules:
- Use tools for all clinic facts, services, dentists and availability. Never invent appointment times, prices, credentials or clinical claims.
- Booking flow: identify the service → preferred day (and optional dentist) → call check_appointment_availability → offer up to 4 real slots → collect full name and email or phone → show a short summary (service, date, time, name) and ask for explicit confirmation → only after the patient clearly says yes, call create_appointment.
- Only say an appointment is confirmed when create_appointment returns ok: true. Always include the booking reference.
- Don't re-ask for details already given. Resolve relative dates ("Saturday", "tomorrow") to YYYY-MM-DD yourself.
- If a slot is gone or a tool errors, explain briefly and offer alternatives.
- For status or cancellation, require the booking reference AND the email or phone used.
- Rescheduling: check availability, book the new slot, then cancel the old one after the patient confirms.
- Do not give diagnoses or medical advice. For emergencies (severe swelling, uncontrolled bleeding, trouble breathing), tell them to call ${CLINIC.phone} or go to the nearest emergency department.
- For anything you can't handle, call request_human_assistance.
- Clinic details are demo data; keep answers short, warm and clear. Use markdown lists for slots and summaries.`;
}

const tools = {
  get_clinic_information: tool({
    description: "Opening hours, address, phone, email, parking and emergency guidance.",
    inputSchema: z.object({}),
    execute: async () => ({ ...CLINIC, mapEmbed: undefined }),
  }),
  search_clinic_services: tool({
    description: "List clinic services with slug, summary and appointment duration.",
    inputSchema: z.object({}),
    execute: async () => SERVICES.map((s) => ({ slug: s.slug, name: s.name, summary: s.summary, durationMinutes: s.duration })),
  }),
  get_dentist_profiles: tool({
    description: "List dentists with slug, specialization, languages and services offered.",
    inputSchema: z.object({}),
    execute: async () => DENTISTS.map(({ photo: _p, ...d }) => d),
  }),
  check_appointment_availability: tool({
    description: "Real available start times for a service on a date. Use the service slug.",
    inputSchema: z.object({
      serviceSlug: z.string(),
      date: z.string().describe("YYYY-MM-DD"),
      dentistSlug: z.string().nullable().describe("Optional dentist slug, null for any"),
    }),
    execute: async (i) => getAvailability(i),
  }),
  create_appointment: tool({
    description: "Reserve a slot. Only call after the patient explicitly confirms the summary.",
    inputSchema: z.object({
      serviceSlug: z.string(),
      startIso: z.string().describe("The exact 'start' value from availability results"),
      dentistSlug: z.string().nullable(),
      name: z.string(),
      email: z.string().nullable(),
      phone: z.string().nullable(),
      notes: z.string().nullable(),
    }),
    execute: async (i) => createAppointment({ ...i, source: "chat" }),
  }),
  get_booking_status: tool({
    description: "Look up a booking by reference plus the email or phone used.",
    inputSchema: z.object({ reference: z.string(), contact: z.string() }),
    execute: async ({ reference, contact }) => getBookingStatus(reference, contact),
  }),
  cancel_appointment: tool({
    description: "Cancel a booking after the patient confirms. Needs reference plus email or phone.",
    inputSchema: z.object({ reference: z.string(), contact: z.string() }),
    execute: async ({ reference, contact }) => cancelAppointment(reference, contact),
  }),
  request_human_assistance: tool({
    description: "Hand the patient over to clinic staff.",
    inputSchema: z.object({ reason: z.string() }),
    execute: async ({ reason }) => ({
      ok: true,
      message: `Please contact the clinic directly: call ${CLINIC.phone} or email ${CLINIC.email}.`,
      reason,
    }),
  }),
};

export async function handleChat(request: Request) {
  const apiKey = process.env['LOVABLE_API_KEY'];
  if (!apiKey) return Response.json({ error: "The assistant isn't configured yet." }, { status: 500 });
  let messages: UIMessage[];
  try {
    const body = (await request.json()) as { messages?: UIMessage[] };
    if (!Array.isArray(body.messages)) throw new Error();
    messages = body.messages.slice(-40);
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const result = streamText({
    model: provider.responses(MODEL),
    instructions: instructions(),
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(50),
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  return withLovableAiGatewayRunIdHeader(
    result.toUIMessageStreamResponse({
      originalMessages: messages,
      sendReasoning: false,
      onError: (e) => {
        console.error("chat error", e);
        const status = (e as { statusCode?: number })?.statusCode;
        if (status === 429) return "The assistant is busy right now. Please try again in a moment.";
        if (status === 402) return "The assistant is temporarily unavailable. Please call the clinic to book.";
        return "Something went wrong. Please try again or call the clinic.";
      },
    }),
    runIdFetch,
  );
}
