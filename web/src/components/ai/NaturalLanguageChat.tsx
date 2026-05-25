import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { copy } from "@/lib/copy/strings";

interface Message {
  role: "user" | "assistant";
  text: string;
  citation?: string;
}

const MOCK_RESPONSES: Record<string, string> = {
  default:   "Your position is healthy. Based on current BTC price and your 32% LTV, you can safely borrow up to $4,200 more today.",
  spend:     "At your current LTV of 32%, you can spend up to $4,200 MUSD safely. If BTC drops 15%, your limit tightens to ~$2,800.",
  ltv:       "Your LTV is 32% — well within the 60% protocol cap and the 75% liquidation threshold. No action needed.",
  liquidate: "Liquidation occurs at 75% LTV. For your position, that means BTC would need to drop to roughly $42,000.",
  repay:     "You owe 16,128 MUSD. You can repay any amount at any time — no penalty and no deadline.",
};

function getResponse(query: string): { text: string; citation: string } {
  const q = query.toLowerCase();
  let text = MOCK_RESPONSES.default;
  if (q.includes("spend") || q.includes("borrow")) text = MOCK_RESPONSES.spend;
  else if (q.includes("ltv"))                        text = MOCK_RESPONSES.ltv;
  else if (q.includes("liquidat"))                   text = MOCK_RESPONSES.liquidate;
  else if (q.includes("repay") || q.includes("debt")) text = MOCK_RESPONSES.repay;
  return { text, citation: "Source: PriceFeed · block #1,204,823" };
}

export function NaturalLanguageChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  async function handleSend() {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", text: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 600));
    const { text, citation } = getResponse(userMsg.text);
    setMessages((m) => [...m, { role: "assistant", text, citation }]);
    setTyping(false);
  }

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        className="ask-collat-fab"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close Ask Collat" : "Ask Collat"}
        aria-expanded={open}
        style={{
          position: "fixed",
          right: "var(--s-4)",
          zIndex: "var(--z-modal)",
          background: "var(--c-primary)", color: "#fff",
          border: "none", borderRadius: "50%",
          width: 52, height: 52,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(225,29,46,.4)",
        }}
      >
        {open ? <X size={20} strokeWidth={1.5} /> : <MessageCircle size={20} strokeWidth={1.5} />}
      </button>

      {/* Chat dock */}
      {open && (
        <div
          role="dialog"
          aria-label="Ask Collat"
          aria-modal="true"
          className="ask-collat-dock"
          style={{
            position: "fixed",
            right: "var(--s-4)",
            zIndex: "var(--z-modal)",
            width: "min(360px, calc(100vw - 2 * var(--s-4)))",
            background: "var(--c-surface)",
            border: "1px solid var(--c-border)",
            borderRadius: "var(--r-4)",
            boxShadow: "var(--sh-card)",
            display: "flex", flexDirection: "column",
            maxHeight: "60vh",
          }}
        >
          <div style={{ padding: "var(--s-3) var(--s-4)", borderBottom: "1px solid var(--c-border)", fontWeight: 600, fontSize: "var(--fs-sm)" }}>
            {copy.ai.chatTitle}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "var(--s-3) var(--s-4)", display: "flex", flexDirection: "column", gap: "var(--s-3)" }}>
            {messages.length === 0 && (
              <p style={{ color: "var(--c-text-mute)", fontSize: "var(--fs-sm)", textAlign: "center", margin: "auto" }}>
                Ask anything about your position.
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%" }}>
                <div
                  style={{
                    padding: "var(--s-2) var(--s-3)",
                    borderRadius: m.role === "user" ? "var(--r-3) var(--r-3) var(--r-1) var(--r-3)" : "var(--r-3) var(--r-3) var(--r-3) var(--r-1)",
                    background: m.role === "user" ? "var(--c-primary)" : "var(--c-surface-2)",
                    color: m.role === "user" ? "#fff" : "var(--c-text)",
                    fontSize: "var(--fs-sm)",
                  }}
                >
                  {m.text}
                </div>
                {m.citation && (
                  <div style={{ fontSize: 10, color: "var(--c-text-mute)", marginTop: 2, paddingLeft: "var(--s-2)" }}>
                    {m.citation}
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div style={{ alignSelf: "flex-start" }}>
                <div style={{ padding: "var(--s-2) var(--s-3)", borderRadius: "var(--r-3)", background: "var(--c-surface-2)", fontSize: "var(--fs-sm)", color: "var(--c-text-mute)" }}>
                  {copy.ai.chatTyping}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "var(--s-2) var(--s-3)", borderTop: "1px solid var(--c-border)", display: "flex", gap: "var(--s-2)" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void handleSend(); } }}
              placeholder={copy.ai.chatPlaceholder}
              aria-label={copy.ai.chatPlaceholder}
              style={{
                flex: 1, background: "var(--c-surface-2)", border: "1px solid var(--c-border)",
                borderRadius: "var(--r-2)", padding: "var(--s-2) var(--s-3)",
                color: "var(--c-text)", fontSize: "var(--fs-sm)", outline: "none",
              }}
            />
            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={!input.trim() || typing}
              aria-label="Send"
              style={{
                background: "var(--c-primary)", border: "none", borderRadius: "var(--r-2)",
                color: "#fff", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", flexShrink: 0,
              }}
            >
              <Send size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
