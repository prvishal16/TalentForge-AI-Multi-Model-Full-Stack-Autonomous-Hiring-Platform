import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { ArrowUp, Sparkles, Wand2 } from "lucide-react";
import { PageHeader } from "@/components/talent/PageHeader";
import { GlassCard } from "@/components/talent/GlassCard";
import { AIThinking } from "@/components/talent/AIThinking";
import { CandidateAvatar } from "@/components/talent/CandidateAvatar";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/recruiter/ai-assistant")({
  head: () => ({ meta: [{ title: "AI Assistant · TalentForge AI" }] }),
  component: Assistant,
});

type Msg = { role: "user" | "assistant"; content: string; thinking?: boolean };

const seed: Msg[] = [
  { role: "assistant", content: "Hey Alex — I'm your TalentForge AI copilot. I can source, screen, rank, and draft outreach. Try asking me to *find 5 backend engineers with Rust and Kafka*." },
];

const suggestions = [
  "Rank my Staff Designer pipeline",
  "Draft outreach for Sarah Jenkins",
  "Which roles are stalling?",
  "Generate a technical loop for AI Research Engineer",
];

function Assistant() {
  const [msgs, setMsgs] = useState<Msg[]>(seed);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  function send(text: string) {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "I found 4 high-signal matches. Elena Rodriguez (98%) and Marcus Chen (92%) stand out — Elena has design-system leadership and Marcus ran platform migrations at scale. Want me to draft personalized outreach?",
        },
      ]);
      setThinking(false);
    }, 1400);
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-4xl flex-col">
      <PageHeader eyebrow="Copilot" title="AI Assistant" description="Ask anything about your talent org." />

      <div className="mt-6 flex-1 space-y-4 overflow-y-auto pr-2">
        {msgs.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn("flex items-start gap-3", m.role === "user" && "flex-row-reverse")}
          >
            {m.role === "assistant" ? (
              <div className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-aurora-violet to-aurora-cyan shadow-[0_4px_16px_-4px_var(--color-aurora-violet)]">
                <Sparkles className="size-4 text-background" />
              </div>
            ) : (
              <CandidateAvatar initials="AR" tint="from-aurora-violet to-aurora-cyan" size={32} />
            )}
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                m.role === "assistant"
                  ? "border hairline surface-1 text-foreground"
                  : "bg-gradient-to-br from-aurora-violet to-aurora-cyan text-background",
              )}
            >
              {m.content}
            </div>
          </motion.div>
        ))}
        {thinking && (
          <div className="flex items-start gap-3">
            <div className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-aurora-violet to-aurora-cyan">
              <Sparkles className="size-4 text-background" />
            </div>
            <AIThinking label="Thinking" />
          </div>
        )}
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="inline-flex items-center gap-1.5 rounded-full border hairline surface-1 px-3 py-1 text-xs text-muted-foreground transition-colors hover:hairline-strong hover:text-foreground"
            >
              <Wand2 className="size-3" /> {s}
            </button>
          ))}
        </div>
        <GlassCard className="!p-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask TalentForge AI…"
              className="flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              className="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-aurora-violet to-aurora-cyan text-background shadow-[0_4px_16px_-4px_var(--color-aurora-violet)] transition-all hover:brightness-110"
            >
              <ArrowUp className="size-4" />
            </button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}