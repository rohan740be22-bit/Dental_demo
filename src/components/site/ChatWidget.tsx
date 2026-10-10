import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isToolUIPart, getToolName, type UIMessage } from "ai";
import { CalendarCheck2, MessageCircle, Phone, RotateCcw, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from "@/components/ai-elements/tool";
import { CLINIC } from "@/lib/clinic";
import { LogoMark } from "./Logo";
import { useChatWidget } from "./chat-context";

const STORAGE_KEY = "sage-dental-chat-v1";
const QUICK = ["Book an appointment", "Explore dental services", "Find a dentist", "Check clinic hours", "Get directions"];

type BookingResult = { ok: boolean; reference?: string; service?: string; dentist?: string; date?: string; time?: string };

function BookingCard({ r }: { r: BookingResult }) {
  return (
    <div className="mt-2 rounded-xl border border-primary/30 bg-accent p-4 text-sm text-accent-foreground">
      <div className="mb-2 flex items-center gap-2 font-semibold">
        <CalendarCheck2 className="size-4" /> Appointment confirmed
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
        <dt className="opacity-70">Reference</dt><dd className="font-mono font-semibold">{r.reference}</dd>
        <dt className="opacity-70">Service</dt><dd>{r.service}</dd>
        <dt className="opacity-70">When</dt><dd>{r.date}, {r.time}</dd>
        <dt className="opacity-70">Dentist</dt><dd>{r.dentist}</dd>
      </dl>
    </div>
  );
}

function ChatPanel() {
  const { setOpen, pending, clearPending } = useChatWidget();
  const [error, setError] = useState<string | null>(null);
  const loaded = useRef(false);
  const { messages, sendMessage, status, stop, setMessages } = useChat({
    id: "clinic-chat",
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onError: (e) => setError(e.message || "Something went wrong. Please try again."),
  });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setMessages(JSON.parse(raw) as UIMessage[]);
    } catch { /* ignore */ }
    loaded.current = true;
  }, [setMessages]);

  useEffect(() => {
    if (loaded.current && !busy) localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages, busy]);

  const send = (text: string) => {
    if (!text.trim() || busy) return;
    setError(null);
    sendMessage({ text });
  };

  useEffect(() => {
    if (pending && loaded.current) {
      send(pending);
      clearPending();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  useEffect(() => {
    if (!busy) document.querySelector<HTMLTextAreaElement>("#clinic-chat-input")?.focus();
  }, [busy]);

  const restart = () => {
    stop();
    setMessages([]);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div
      role="dialog"
      aria-label="Clinic assistant"
      className="fixed inset-0 z-50 flex flex-col bg-background sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[640px] sm:max-h-[calc(100vh-8rem)] sm:w-[400px] sm:rounded-2xl sm:border sm:border-border sm:shadow-lift animate-fade-up"
    >
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <LogoMark className="size-9" />
        <div className="flex-1">
          <p className="text-sm font-semibold">Sage Assistant</p>
          <p className="text-xs text-muted-foreground">Book visits & answer questions</p>
        </div>
        <button onClick={restart} className="rounded-md p-2 text-muted-foreground hover:bg-muted" aria-label="Restart conversation" title="Restart">
          <RotateCcw className="size-4" />
        </button>
        <button onClick={() => setOpen(false)} className="rounded-md p-2 text-muted-foreground hover:bg-muted" aria-label="Close assistant">
          <X className="size-4" />
        </button>
      </div>

      <Conversation className="flex-1">
        <ConversationContent className="gap-5 px-4">
          {messages.length === 0 && (
            <div className="space-y-4 pt-2">
              <p className="text-sm leading-relaxed">
                Hello! Welcome to {CLINIC.name}. I can help you explore our services, answer general clinic questions, and book an appointment. What would you like help with today?
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK.map((q) => (
                  <button key={q} onClick={() => send(q)} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs hover:border-primary hover:text-primary">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m) => (
            <Message key={m.id} from={m.role}>
              <MessageContent className={m.role === "user" ? "bg-primary text-primary-foreground" : "bg-transparent p-0"}>
                {m.parts.map((p, i) => {
                  if (p.type === "text") return m.role === "user" ? <span key={i}>{p.text}</span> : <MessageResponse key={i}>{p.text}</MessageResponse>;
                  if (isToolUIPart(p)) {
                    const name = getToolName(p);
                    const out = p.state === "output-available" ? (p.output as BookingResult) : null;
                    return (
                      <div key={i}>
                        <Tool defaultOpen={false}>
                          <ToolHeader {...(p.type === "dynamic-tool" ? { type: p.type, state: p.state, toolName: p.toolName } : { type: p.type, state: p.state })} />
                          <ToolContent>
                            <ToolInput input={p.input} />
                            <ToolOutput output={p.output} errorText={p.errorText} />
                          </ToolContent>
                        </Tool>
                        {name === "create_appointment" && out?.ok && <BookingCard r={out} />}
                      </div>
                    );
                  }
                  return null;
                })}
              </MessageContent>
            </Message>
          ))}
          {status === "submitted" && <Shimmer className="text-sm">Thinking…</Shimmer>}
          {error && (
            <div className="rounded-lg border border-destructive/30 p-3 text-sm text-destructive">
              {error}{" "}
              <a href={CLINIC.phoneHref} className="underline">Call the clinic</a>
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border p-3">
        <PromptInput onSubmit={(msg) => send(msg.text)}>
          <PromptInputTextarea id="clinic-chat-input" placeholder="Ask or book an appointment…" autoFocus />
          <PromptInputFooter className="justify-between">
            <a href={CLINIC.phoneHref} className="flex items-center gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground">
              <Phone className="size-3" /> Prefer to call?
            </a>
            <PromptInputSubmit status={status} onStop={stop} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}

export function ChatWidget() {
  const { open, setOpen } = useChatWidget();
  return (
    <>
      {open && <ChatPanel />}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close assistant" : "Chat with our booking assistant"}
        className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-lift transition-transform hover:-translate-y-0.5 sm:bottom-6 sm:right-6 ${open ? "max-sm:hidden" : ""}`}
      >
        {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
        <span className="hidden sm:inline">{open ? "Close" : "Book with our assistant"}</span>
      </button>
    </>
  );
}
