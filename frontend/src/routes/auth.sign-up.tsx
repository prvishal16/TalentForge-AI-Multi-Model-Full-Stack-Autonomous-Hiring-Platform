import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, Eye, EyeOff, Info, Loader2, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AuroraBackground } from "@/components/talent/AuroraBackground";
import { GlassCard } from "@/components/talent/GlassCard";
import { AuroraButton } from "@/components/talent/AuroraButton";
import { Logo } from "@/components/talent/Logo";
import { BackToHome } from "@/components/talent/BackToHome";
import { DEMO_ACCOUNTS, signInAs, type Role } from "@/lib/auth";

export const Route = createFileRoute("/auth/sign-up")({
  head: () => ({ meta: [{ title: "Sign up · TalentForge AI" }] }),
  component: SignUp,
});

function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-4
}

function SignUp() {
  const navigate = useNavigate();
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [terms, setTerms] = useState(false);
  const [demoShown, setDemoShown] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const strength = useMemo(() => passwordStrength(pw), [pw]);
  const strengthLabel = ["Too weak", "Weak", "Fair", "Strong", "Excellent"][strength];

  function validate() {
    const e: Record<string, string> = {};
    if (!first.trim()) e.first = "Required";
    if (!last.trim()) e.last = "Required";
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Enter a valid email";
    if (pw.length < 8) e.pw = "Minimum 8 characters";
    else if (strength < 3) e.pw = "Use uppercase, numbers, and symbols";
    if (pw2 !== pw) e.pw2 = "Passwords don't match";
    if (!terms) e.terms = "You must accept the terms";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);
    setDemoShown(true);
    toast.info("Demo Mode", {
      description: "Real account creation will be available after backend implementation.",
    });
  }

  async function enterAs(role: Role) {
    const s = signInAs(role);
    toast.success(`Signed in as ${s.name}`, { description: `Entering ${role} workspace…` });
    await new Promise((r) => setTimeout(r, 400));
    if (role === "recruiter") await navigate({ to: "/app/recruiter/dashboard" });
    else await navigate({ to: "/app/candidate/dashboard" });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-6 py-24">
      <AuroraBackground />
      <BackToHome />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid w-full max-w-5xl gap-6 md:grid-cols-2"
      >
        <div className="hidden md:block">
          <Logo />
          <h1 className="mt-8 text-3xl font-medium tracking-tight text-foreground">
            Hire smarter.{" "}
            <span className="aurora-text">Recruit at the speed of intelligence.</span>
          </h1>
          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            {[
              "ATS + resume intelligence in one workspace",
              "AI copilot for every recruiter",
              "Enterprise SSO + audit logs",
              "14-day free trial",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Check className="size-4 text-aurora-cyan" /> {t}
              </li>
            ))}
          </ul>

          <div className="mt-10 rounded-2xl border hairline surface-1 p-4 text-xs text-muted-foreground backdrop-blur-md">
            <div className="flex items-center gap-2 text-foreground">
              <Info className="size-3.5 text-aurora-cyan" />
              <span className="font-medium">Prototype notice</span>
            </div>
            <p className="mt-1">
              This is a frontend prototype. New signups aren't persisted — use a demo account to
              explore the full experience.
            </p>
          </div>
        </div>

        <GlassCard>
          <div className="mb-4 md:hidden">
            <Logo />
          </div>
          <h2 className="text-2xl font-medium tracking-tight">Create your workspace</h2>
          <p className="mt-1 text-sm text-muted-foreground">Free for 14 days · no card required</p>

          <form className="mt-6 space-y-3" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="text-xs text-muted-foreground">First name</span>
                <input
                  value={first}
                  onChange={(e) => setFirst(e.target.value)}
                  className="mt-1 w-full rounded-lg border hairline surface-1 px-3 py-2 text-sm outline-none focus:border-aurora-cyan/50 focus:ring-2 focus:ring-aurora-cyan/20"
                />
                {errors.first && <p className="mt-1 text-[10px] text-destructive">{errors.first}</p>}
              </label>
              <label className="block">
                <span className="text-xs text-muted-foreground">Last name</span>
                <input
                  value={last}
                  onChange={(e) => setLast(e.target.value)}
                  className="mt-1 w-full rounded-lg border hairline surface-1 px-3 py-2 text-sm outline-none focus:border-aurora-cyan/50 focus:ring-2 focus:ring-aurora-cyan/20"
                />
                {errors.last && <p className="mt-1 text-[10px] text-destructive">{errors.last}</p>}
              </label>
            </div>
            <label className="block">
              <span className="text-xs text-muted-foreground">Work email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border hairline surface-1 px-3 py-2 text-sm outline-none focus:border-aurora-cyan/50 focus:ring-2 focus:ring-aurora-cyan/20"
              />
              {errors.email && <p className="mt-1 text-[10px] text-destructive">{errors.email}</p>}
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">Password</span>
              <div className="relative mt-1">
                <input
                  type={showPw ? "text" : "password"}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  className="w-full rounded-lg border hairline surface-1 px-3 py-2 pr-10 text-sm outline-none focus:border-aurora-cyan/50 focus:ring-2 focus:ring-aurora-cyan/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:text-foreground"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <div className="mt-1 flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i < strength
                        ? strength >= 3
                          ? "bg-aurora-emerald"
                          : strength === 2
                            ? "bg-aurora-cyan"
                            : "bg-amber-400"
                        : "surface-3"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">{pw ? strengthLabel : "Use 8+ chars, mix case, numbers & symbols"}</p>
              {errors.pw && <p className="mt-1 text-[10px] text-destructive">{errors.pw}</p>}
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">Confirm password</span>
              <input
                type={showPw ? "text" : "password"}
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                className="mt-1 w-full rounded-lg border hairline surface-1 px-3 py-2 text-sm outline-none focus:border-aurora-cyan/50 focus:ring-2 focus:ring-aurora-cyan/20"
              />
              {errors.pw2 && <p className="mt-1 text-[10px] text-destructive">{errors.pw2}</p>}
            </label>

            <label className="flex items-start gap-2 pt-1 text-[11px] text-muted-foreground">
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="mt-0.5 size-3.5 rounded accent-aurora-cyan"
              />
              <span>
                I agree to the{" "}
                <a className="text-aurora-cyan hover:underline">Terms</a> and{" "}
                <a className="text-aurora-cyan hover:underline">Privacy Policy</a>.
              </span>
            </label>
            {errors.terms && <p className="text-[10px] text-destructive">{errors.terms}</p>}

            <AnimatePresence>
              {demoShown && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 rounded-lg border border-aurora-cyan/30 bg-aurora-cyan/5 px-3 py-2 text-xs text-foreground"
                >
                  <Sparkles className="mt-0.5 size-3.5 shrink-0 text-aurora-cyan" />
                  <div>
                    <p className="font-medium">Demo Mode</p>
                    <p className="text-muted-foreground">
                      Real account creation will be available after backend implementation. Enter as
                      a demo user below.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!demoShown ? (
              <AuroraButton type="submit" disabled={submitting} className="w-full">
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Creating…
                  </>
                ) : (
                  <>
                    Create workspace <ArrowRight className="size-4" />
                  </>
                )}
              </AuroraButton>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => enterAs("recruiter")}
                  className="rounded-lg border hairline surface-1 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:hairline-strong hover:surface-2"
                >
                  Enter as Recruiter
                </button>
                <button
                  type="button"
                  onClick={() => enterAs("candidate")}
                  className="rounded-lg border hairline surface-1 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:hairline-strong hover:surface-2"
                >
                  Enter as Candidate
                </button>
              </div>
            )}
          </form>

          {demoShown && (
            <div className="mt-4 space-y-1.5 rounded-lg border hairline surface-1 p-3 font-mono text-[10.5px] text-muted-foreground">
              <p className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">
                Demo credentials
              </p>
              <p>
                <span className="text-foreground">Recruiter</span> · {DEMO_ACCOUNTS.recruiter.email} · {DEMO_ACCOUNTS.recruiter.password}
              </p>
              <p>
                <span className="text-foreground">Candidate</span> · {DEMO_ACCOUNTS.candidate.email} · {DEMO_ACCOUNTS.candidate.password}
              </p>
            </div>
          )}

          <p className="mt-5 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link to="/auth/sign-in" className="text-aurora-cyan hover:underline">
              Sign in
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}