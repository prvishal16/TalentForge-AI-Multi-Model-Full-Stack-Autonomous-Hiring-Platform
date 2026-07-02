import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion, useAnimationControls } from "motion/react";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Copy,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AuroraBackground } from "@/components/talent/AuroraBackground";
import { GlassCard } from "@/components/talent/GlassCard";
import { AuroraButton } from "@/components/talent/AuroraButton";
import { Logo } from "@/components/talent/Logo";
import { BackToHome } from "@/components/talent/BackToHome";
import { DEMO_ACCOUNTS, signIn, type Role } from "@/lib/auth";

export const Route = createFileRoute("/auth/sign-in")({
  head: () => ({ meta: [{ title: "Sign in · TalentForge AI" }] }),
  component: SignIn,
});

type Status = "idle" | "loading" | "success" | "error";

function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [capsOn, setCapsOn] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const controls = useAnimationControls();

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setError(null);
    setStatus("loading");
    await new Promise((r) => setTimeout(r, 850));
    const session = signIn(email, password);
    if (!session) {
      setStatus("error");
      setError("Invalid email or password. Please use a demo account below.");
      controls.start({ x: [0, -10, 10, -8, 8, -4, 4, 0], transition: { duration: 0.5 } });
      toast.error("Authentication Failed", {
        description: "Invalid email or password. Please use a demo account.",
      });
      setTimeout(() => setStatus("idle"), 400);
      return;
    }
    setStatus("success");
    toast.success(`Welcome back, ${session.name.split(" ")[0]}`, {
      description: `Entering your ${session.role} workspace…`,
    });
    await new Promise((r) => setTimeout(r, 500));
    if (session.role === "recruiter") await navigate({ to: "/app/recruiter/dashboard" });
    else await navigate({ to: "/app/candidate/dashboard" });
  }

  function fill(role: Role) {
    const a = DEMO_ACCOUNTS[role];
    setEmail(a.email);
    setPassword(a.password);
    setError(null);
    toast.success(`Filled ${role} credentials`, { description: "Press Sign in to continue." });
  }

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Copy failed");
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-6 py-24">
      <AuroraBackground />
      <BackToHome />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <motion.div animate={controls}>
          <GlassCard>
            <h1 className="text-2xl font-medium tracking-tight text-foreground">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to your TalentForge workspace
            </p>

            <form className="mt-6 space-y-3" onSubmit={handleSubmit} noValidate>
              <label className="block">
                <span className="text-xs text-muted-foreground">Work email</span>
                <input
                  ref={emailRef}
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="mt-1 w-full rounded-lg border hairline surface-1 px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-aurora-cyan/50 focus:ring-2 focus:ring-aurora-cyan/20"
                />
              </label>
              <label className="block">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Password</span>
                  <button
                    type="button"
                    onClick={() =>
                      toast.info("Demo mode", {
                        description:
                          "Password reset will be available after backend integration.",
                      })
                    }
                    className="text-[11px] text-aurora-cyan hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative mt-1">
                  <input
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyUp={(e) => setCapsOn(e.getModifierState && e.getModifierState("CapsLock"))}
                    placeholder="••••••••"
                    className="w-full rounded-lg border hairline surface-1 px-3 py-2 pr-10 text-sm text-foreground outline-none transition-colors focus:border-aurora-cyan/50 focus:ring-2 focus:ring-aurora-cyan/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <AnimatePresence>
                  {capsOn && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-1 flex items-center gap-1 text-[10px] text-amber-400"
                    >
                      <AlertCircle className="size-3" /> Caps Lock is on
                    </motion.p>
                  )}
                </AnimatePresence>
              </label>

              <div className="flex items-center justify-between pt-1">
                <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="size-3.5 rounded border-hairline-strong bg-transparent accent-aurora-cyan"
                  />
                  Remember me
                </label>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
                  >
                    <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                    <div>
                      <p className="font-medium">Authentication Failed</p>
                      <p className="opacity-90">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AuroraButton
                type="submit"
                disabled={status === "loading" || status === "success"}
                className="w-full"
              >
                {status === "loading" && (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Authenticating…
                  </>
                )}
                {status === "success" && (
                  <>
                    <Check className="size-4" /> Success
                  </>
                )}
                {(status === "idle" || status === "error") && (
                  <>
                    Sign in <ArrowRight className="size-4" />
                  </>
                )}
              </AuroraButton>
            </form>

            <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
              <span className="h-px flex-1 surface-3" />
              or
              <span className="h-px flex-1 surface-3" />
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() =>
                  toast.info("Demo", {
                    description:
                      "Google authentication will be available after backend integration.",
                  })
                }
                className="w-full rounded-lg border hairline surface-1 py-2 text-sm text-foreground transition-colors hover:hairline-strong hover:surface-2"
              >
                Continue with Google
              </button>
              <button
                type="button"
                onClick={() =>
                  toast.info("Demo", {
                    description: "SSO will be available after backend integration.",
                  })
                }
                className="w-full rounded-lg border hairline surface-1 py-2 text-sm text-foreground transition-colors hover:hairline-strong hover:surface-2"
              >
                Continue with SSO
              </button>
            </div>

            <p className="mt-5 text-center text-xs text-muted-foreground">
              No account?{" "}
              <Link to="/auth/sign-up" className="text-aurora-cyan hover:underline">
                Get started
              </Link>
            </p>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mt-4"
        >
          <GlassCard className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="size-3.5 text-aurora-cyan" />
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Demo Accounts
              </p>
            </div>
            <div className="space-y-2">
              {(["recruiter", "candidate"] as Role[]).map((role) => {
                const a = DEMO_ACCOUNTS[role];
                return (
                  <div
                    key={role}
                    className="rounded-lg border hairline surface-1 p-3 transition-colors hover:hairline-strong"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium capitalize text-foreground">{role}</p>
                      <button
                        type="button"
                        onClick={() => fill(role)}
                        className="rounded-md border hairline surface-2 px-2 py-0.5 text-[10px] font-medium text-aurora-cyan transition-colors hover:hairline-strong"
                      >
                        Fill
                      </button>
                    </div>
                    <div className="mt-2 space-y-1 font-mono text-[11px] text-muted-foreground">
                      <button
                        type="button"
                        onClick={() => copy(a.email, "Email")}
                        className="flex w-full items-center justify-between gap-2 rounded px-1 py-0.5 text-left hover:text-foreground"
                      >
                        <span className="truncate">{a.email}</span>
                        <Copy className="size-3 shrink-0 opacity-60" />
                      </button>
                      <button
                        type="button"
                        onClick={() => copy(a.password, "Password")}
                        className="flex w-full items-center justify-between gap-2 rounded px-1 py-0.5 text-left hover:text-foreground"
                      >
                        <span className="truncate">{a.password}</span>
                        <Copy className="size-3 shrink-0 opacity-60" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </div>
  );
}