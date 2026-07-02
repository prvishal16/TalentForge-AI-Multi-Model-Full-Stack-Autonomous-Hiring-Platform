import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  BrainCircuit,
  ChevronRight,
  FileSearch,
  GaugeCircle,
  MessagesSquare,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";
import { AuroraBackground } from "@/components/talent/AuroraBackground";
import { Logo } from "@/components/talent/Logo";
import { AuroraButton } from "@/components/talent/AuroraButton";
import { GlassCard } from "@/components/talent/GlassCard";
import { SiteFooter } from "@/components/talent/SiteFooter";

export const Route = createFileRoute("/")({
  component: Landing,
});

const features = [
  {
    icon: FileSearch,
    title: "Resume Intelligence",
    body: "Parse, score, and enrich every resume with an explainable ATS breakdown in under 400ms.",
  },
  {
    icon: BrainCircuit,
    title: "AI Recruiter Copilot",
    body: "A domain-tuned agent that sources, drafts outreach, and ranks talent against your loop.",
  },
  {
    icon: Workflow,
    title: "Pipeline Automation",
    body: "Move candidates through stages with rules that adapt to your hiring bar in real time.",
  },
  {
    icon: MessagesSquare,
    title: "Interview Studio",
    body: "Generate role-specific questions, rubrics, and post-loop scorecards in one click.",
  },
  {
    icon: GaugeCircle,
    title: "Hiring Analytics",
    body: "Funnel, velocity, and quality-of-hire — sliced by team, source, and rubric dimension.",
  },
  {
    icon: Users,
    title: "Enterprise-Grade RBAC",
    body: "SSO, granular roles, and audit logs that meet the bar for regulated teams.",
  },
];

const logos = ["Northwind", "Helios AI", "Parallax", "Orbital", "Meridian", "Slipstream"];

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <AuroraBackground />

      {/* Nav */}
      <header className="sticky top-0 z-30 border-b hairline bg-background/40 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">Product</a>
            <a href="#pricing" className="transition-colors hover:text-foreground">Pricing</a>
            <a href="#customers" className="transition-colors hover:text-foreground">Customers</a>
            <Link to="/auth/sign-in" className="transition-colors hover:text-foreground">Live Demo</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/auth/sign-in" className="hidden rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline">
              Sign in
            </Link>
            <Link to="/auth/sign-up">
              <AuroraButton className="text-sm">
                Get started <ArrowRight className="size-4" />
              </AuroraButton>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24 pt-24 text-center md:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border hairline surface-1 px-3 py-1 text-xs text-muted-foreground backdrop-blur-md"
        >
          <Sparkles className="size-3.5 text-aurora-cyan" />
          New — Multi-model AI Recruiter powered by Gemini, GPT & Claude
          <ChevronRight className="size-3.5" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mx-auto max-w-3xl text-balance text-5xl font-medium tracking-tight md:text-6xl lg:text-7xl"
        >
          Hire smarter.
          <br />
          Recruit at the speed of <span className="aurora-text">intelligence</span>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-6 max-w-xl text-balance text-lg text-muted-foreground"
        >
          TalentForge AI is the recruitment platform for modern teams. ATS, resume intelligence,
          and an AI copilot in one premium workspace.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <Link to="/auth/sign-in">
            <AuroraButton className="px-5 py-2.5">
              Explore live demo <ArrowRight className="size-4" />
            </AuroraButton>
          </Link>
          <Link
            to="/auth/sign-in"
            className="inline-flex items-center gap-2 rounded-lg border hairline surface-1 px-5 py-2.5 text-sm font-medium text-foreground backdrop-blur-md transition-colors hover:surface-2"
          >
            Candidate workspace
          </Link>
        </motion.div>

        {/* Hero preview card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto mt-16 max-w-5xl"
        >
          <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-tr from-aurora-violet/30 via-transparent to-aurora-cyan/30 blur-2xl" />
          <GlassCard className="!p-0 overflow-hidden">
            <div className="grid grid-cols-3 border-b hairline">
              {[
                { label: "Open Roles", value: "12", delta: "+2 mom" },
                { label: "Candidates in Pipeline", value: "247", delta: "+18 wow" },
                { label: "Avg Time to Hire", value: "8.4d", delta: "-1.2d" },
              ].map((k) => (
                <div key={k.label} className="border-r hairline p-6 last:border-r-0">
                  <p className="text-xs text-muted-foreground">{k.label}</p>
                  <p className="mt-2 font-mono text-2xl text-foreground">{k.value}</p>
                  <p className="mt-1 text-[10px] text-aurora-cyan">{k.delta}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
              <div>
                <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Hiring funnel · last 30d
                </p>
                <div className="space-y-2">
                  {[
                    { label: "Applied", w: 100, n: "4,209" },
                    { label: "Screening", w: 82, n: "1,840" },
                    { label: "Interview", w: 54, n: "512" },
                    { label: "Offer", w: 22, n: "82" },
                    { label: "Hired", w: 14, n: "54" },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center gap-3">
                      <span className="w-20 text-xs text-muted-foreground">{r.label}</span>
                      <div className="flex h-6 flex-1 items-center rounded-md surface-1">
                        <div
                          className="h-full rounded-md bg-gradient-to-r from-aurora-violet/70 to-aurora-cyan/70"
                          style={{ width: `${r.w}%` }}
                        />
                      </div>
                      <span className="w-14 text-right font-mono text-xs tabular-nums text-foreground">{r.n}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border hairline bg-gradient-to-br from-aurora-violet/10 to-transparent p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">Talent Insights</p>
                  <span className="rounded border border-aurora-violet/20 bg-aurora-violet/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-aurora-violet">
                    AI
                  </span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="rounded-lg border hairline surface-1 p-3">
                    <p className="text-foreground/90">
                      <span className="text-aurora-cyan">Elena Rodriguez</span> matches 98% for Staff Product Designer. Fast-track recommended.
                    </p>
                  </div>
                  <div className="rounded-lg border hairline surface-1 p-3">
                    <p className="text-foreground/90">
                      Platform Engineer funnel drops 14% at technical screen. Rubric drift detected.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </section>

      {/* Logos */}
      <section id="customers" className="mx-auto max-w-6xl px-6 pb-10">
        <p className="mb-6 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          Trusted by high-velocity hiring teams
        </p>
        <div className="grid grid-cols-2 items-center gap-6 sm:grid-cols-3 md:grid-cols-6">
          {logos.map((l) => (
            <div key={l} className="text-center text-sm text-muted-foreground/70">
              {l}
            </div>
          ))}
        </div>
      </section>

      {/* Features bento */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-12 max-w-2xl">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-aurora-cyan">Platform</p>
          <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
            One workspace for the entire hiring loop.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Everything a modern talent team needs — designed with the taste of the tools you already love.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.04 }}
              >
                <GlassCard className="h-full transition-colors hover:hairline-strong">
                  <div className="mb-4 grid size-10 place-items-center rounded-xl bg-gradient-to-br from-aurora-violet/20 to-aurora-cyan/20 ring-1 ring-white/10">
                    <Icon className="size-5 text-aurora-cyan" />
                  </div>
                  <h3 className="text-base font-medium text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Pricing teaser */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 pb-24">
        <GlassCard className="relative overflow-hidden !p-10 text-center">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-aurora-violet/15 via-transparent to-aurora-cyan/15" />
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-aurora-cyan">Pricing</p>
          <h3 className="text-3xl font-medium tracking-tight md:text-4xl">
            Start free. Scale with your loops.
          </h3>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Transparent per-seat pricing. Unlimited jobs. Unlimited AI actions on Growth and Enterprise plans.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/auth/sign-up">
              <AuroraButton>Start free trial</AuroraButton>
            </Link>
            <Link
              to="/auth/sign-in"
              className="inline-flex items-center gap-2 rounded-lg border hairline surface-1 px-4 py-2 text-sm font-medium text-foreground backdrop-blur-md transition-colors hover:surface-2"
            >
              See it in action
            </Link>
          </div>
        </GlassCard>
      </section>

      <SiteFooter />
    </div>
  );
}
