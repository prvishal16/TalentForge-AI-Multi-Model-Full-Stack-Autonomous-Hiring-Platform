import { motion } from "motion/react";
import { Trash2, Wand2 } from "lucide-react";
import { GlassCard } from "@/components/talent/GlassCard";
import { AuroraButton } from "@/components/talent/AuroraButton";

const EXAMPLE_JD = `Senior Frontend Engineer — Payments Platform

We're hiring a Senior Frontend Engineer to lead the UI for our payments platform. You'll own the checkout experience end-to-end across React, TypeScript, and TanStack Query, working closely with design, product, and backend teams.

What you'll do
- Design and ship customer-facing surfaces used by 40M+ users per month
- Lead front-end architecture decisions across a growing team
- Drive performance, accessibility, and reliability initiatives
- Partner with platform teams on GraphQL schema and observability

You have
- 6+ years shipping production React with TypeScript
- Strong system design instincts and a track record leading complex FE projects
- Comfort with modern tooling — Vite, Playwright, Storybook, GraphQL, Framer Motion
- Experience mentoring engineers and driving cross-functional work`;

export function JDInput({
  value,
  onChange,
  onBack,
  onContinue,
}: {
  value: string;
  onChange: (v: string) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const chars = value.length;
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;
  const ready = chars >= 120;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <GlassCard>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-foreground">Paste the job description</h3>
            <p className="text-xs text-muted-foreground">The more detail, the more targeted your interview will be.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onChange(EXAMPLE_JD)}
              className="inline-flex items-center gap-1.5 rounded-lg border hairline surface-1 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Wand2 className="size-3.5" /> Load example
            </button>
            <button
              onClick={() => onChange("")}
              className="inline-flex items-center gap-1.5 rounded-lg border hairline surface-1 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="size-3.5" /> Clear
            </button>
          </div>
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste the JD here — role, responsibilities, requirements…"
          className="min-h-[280px] w-full resize-y rounded-xl border hairline surface-1 p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-aurora-cyan/40"
        />
        <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="font-mono">{chars.toLocaleString()} chars · {words} words</span>
          <span className={ready ? "text-aurora-emerald" : "text-muted-foreground"}>
            {ready ? "Ready to analyze" : `Need ${120 - chars} more chars`}
          </span>
        </div>
      </GlassCard>

      <div className="flex justify-between">
        <button onClick={onBack} className="rounded-lg border hairline surface-1 px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
          Back
        </button>
        <AuroraButton onClick={onContinue} disabled={!ready}>Analyze</AuroraButton>
      </div>
    </motion.div>
  );
}