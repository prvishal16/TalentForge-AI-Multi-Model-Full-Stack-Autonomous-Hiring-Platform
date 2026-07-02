import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Send, Sparkles, X } from "lucide-react";

type Msg = { role: "user" | "ai"; text: string };

const CANNED = [
  "Great question — based on your current pipeline, I'd prioritize the Platform Engineer role (14% drop-off at technical). Want me to draft a rubric refresh?",
  "I found 12 candidates in your talent pool matching that criteria. The top 3 have a match score above 92%. Shall I shortlist them?",
  "Here's a suggestion: rewrite that bullet as 'Migrated payments platform to Kafka, reducing p99 latency by 42% and saving $180K/yr.' — recruiters weight impact metrics 2× higher.",
  "Scheduling interviews for tomorrow between 2–5 PM IST. I'll send calendar holds and prep-pack emails to the interviewers.",
  "Your resume ATS score improved by +6 points after the last edit. You're now in the top 18% of Product Managers on TalentForge.",
];

const SUGGESTIONS = [
  "Rank candidates for Senior Platform Engineer",
  "Improve my resume summary",
  "Draft an outreach email to Elena Rodriguez",
  "Which role should I focus on this week?",
];

export function AIAssistantWidget() {
  const [open, setOpen] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "ai", text: "Hi — I'm your TalentForge copilot. Ask me anything about your pipeline, candidates, or resume." },
  ]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function send(text: string) {
    const q = text.trim();
    if (!q) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setThinking(true);
    const reply = CANNED[Math.floor(Math.random() * CANNED.length)];
    // Stream the reply char-by-char
    setTimeout(() => {
      setThinking(false);
      let i = 0;
      setMessages((m) => [...m, { role: "ai", text: "" }]);
      const interval = setInterval(() => {
        i += 3;
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "ai", text: reply.slice(0, i) };
          return copy;
        });
        if (i >= reply.length) clearInterval(interval);
      }, 18);
    }, 900);
  }

  return (
    <>
      <motion.button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open AI Assistant"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 grid size-14 place-items-center rounded-full bg-gradient-to-br from-aurora-violet to-aurora-cyan shadow-[0_10px_40px_-10px_rgba(192,132,252,0.7)] ring-1 ring-white/20"
      >
        <motion.span
          className="absolute inset-0 -z-10 rounded-full bg-aurora-cyan/40 blur-2xl"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
        <Sparkles className="size-6 text-black" strokeWidth={2.2} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="fixed bottom-24 right-6 z-50 flex h-[560px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border hairline bg-background/95 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b hairline px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-aurora-violet to-aurora-cyan">
                    <Sparkles className="size-3.5 text-black" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">TalentForge Copilot</p>
                    <p className="text-[10px] text-aurora-cyan">● Online · GPT-class</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-md p-1 text-muted-foreground hover:surface-1 hover:text-foreground">
                  <X className="size-4" />
                </button>
              </div>

              <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${m.role === "user" ? "bg-gradient-to-br from-aurora-violet to-aurora-cyan text-black" : "border hairline surface-1 text-foreground"}`}>
                      {m.text}
                      {m.role === "ai" && m.text === "" && <span className="opacity-60">…</span>}
                    </div>
                  </div>
                ))}
                {thinking && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl border hairline surface-1 px-3 py-2">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.span key={i} className="size-1.5 rounded-full bg-aurora-cyan" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {messages.length === 1 && (
                  <div className="pt-2">
                    <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Try asking</p>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTIONS.map((s) => (
                        <button key={s} onClick={() => send(s)} className="rounded-full border hairline surface-1 px-2.5 py-1 text-xs text-foreground/80 hover:border-aurora-cyan/40 hover:text-foreground">
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex items-center gap-2 border-t hairline surface-1 p-3"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything…"
                  className="flex-1 rounded-lg border hairline surface-1 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-aurora-cyan/40"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || thinking}
                  className="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-aurora-violet to-aurora-cyan text-black disabled:opacity-40"
                >
                  <Send className="size-4" />
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}