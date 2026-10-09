import { createContext, useContext, useState, type ReactNode } from "react";

type Ctx = { open: boolean; setOpen: (v: boolean) => void; ask: (text?: string) => void; pending: string | null; clearPending: () => void };
const ChatCtx = createContext<Ctx | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  return (
    <ChatCtx.Provider
      value={{
        open,
        setOpen,
        pending,
        clearPending: () => setPending(null),
        ask: (text) => {
          if (text) setPending(text);
          setOpen(true);
        },
      }}
    >
      {children}
    </ChatCtx.Provider>
  );
}

export function useChatWidget() {
  const c = useContext(ChatCtx);
  if (!c) throw new Error("useChatWidget outside ChatProvider");
  return c;
}
