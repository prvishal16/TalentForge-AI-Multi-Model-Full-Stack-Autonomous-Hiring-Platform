import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function SiteFooter({ className }: { className?: string }) {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn("relative isolate mt-16", className)}
      aria-label="Site footer"
    >
      {/* hairline gradient divider */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
      />
      {/* radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        style={{
          background:
            "radial-gradient(60% 120% at 50% 100%, color-mix(in oklab, var(--color-aurora-violet) 10%, transparent) 0%, transparent 70%)",
        }}
      />
      {/* noise */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      <div className="bg-background/40 backdrop-blur-xl">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-6 py-10 md:grid-cols-3 md:py-8">
          {/* Left — brand */}
          <div className="flex flex-col items-center gap-1 md:items-start">
            <span className="text-sm font-medium tracking-tight text-foreground">
              TalentForge <span className="text-muted-foreground">AI</span>
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
              Enterprise AI Recruitment Platform
            </span>
          </div>

          {/* Center — signature */}
          <div className="flex flex-col items-center gap-1.5 text-center">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground/60">
              Designed &amp; Engineered by
            </span>
            <a
              href="https://github.com/PRVishal16"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-block cursor-pointer"
            >
              <motion.span
                whileHover={{ y: -1.5 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="signature-name relative inline-block text-lg font-medium tracking-tight md:text-xl"
              >
                P R Vishal16
              </motion.span>
              <span
                aria-hidden
                className="pointer-events-none absolute -inset-x-3 -inset-y-1 -z-10 rounded-lg opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(50% 80% at 50% 50%, color-mix(in oklab, var(--color-aurora-cyan) 35%, transparent), transparent 70%)",
                }}
              />
              <span
                aria-hidden
                className="absolute -bottom-1 left-1/2 h-px w-0 -translate-x-1/2 bg-gradient-to-r from-aurora-violet via-aurora-cyan to-aurora-violet transition-all duration-500 ease-out group-hover:w-full"
              />
            </a>
          </div>

          {/* Right — version / status */}
          <div className="flex items-center justify-center gap-6 md:justify-end">
            <div className="flex flex-col items-end">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
                Version
              </span>
              <span className="font-mono text-xs tabular-nums text-foreground/80">1.0.0</span>
            </div>
            <div className="h-6 w-px surface-3" aria-hidden />
            <div className="flex flex-col items-end">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
                Build
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-foreground/80">
                <span className="relative inline-flex size-1.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/50" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgb(52_211_153/0.7)]" />
                </span>
                Stable
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}