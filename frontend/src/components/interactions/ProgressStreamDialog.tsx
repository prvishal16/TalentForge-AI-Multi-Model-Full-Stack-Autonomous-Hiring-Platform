import { useEffect, useState } from "react";
import { Sparkles, CheckCircle2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { streamSteps, type ProgressStep } from "@/lib/mock/simulate";
import { AuroraButton } from "@/components/talent/AuroraButton";
import { cn } from "@/lib/utils";

export type StreamResult = {
  headline: string;
  bullets: string[];
  ctaLabel?: string;
  onCta?: () => void;
};

export function ProgressStreamDialog({
  open,
  title,
  eyebrow = "AI in progress",
  steps,
  result,
  onClose,
  autoRunKey,
}: {
  open: boolean;
  title: string;
  eyebrow?: string;
  steps: ProgressStep[];
  result: StreamResult;
  onClose: () => void;
  /** Change this value to re-run when re-opening. */
  autoRunKey?: string | number;
}) {
  const [log, setLog] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLog([]);
    setProgress(0);
    setDone(false);
    let cancelled = false;
    (async () => {
      await streamSteps(
        steps,
        (_i, label) => {
          if (cancelled) return;
          setLog((l) => [...l, label]);
        },
        (p) => !cancelled && setProgress(p),
      );
      if (!cancelled) setDone(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, autoRunKey]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed left-1/2 top-1/2 z-50 w-[min(560px,92vw)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border hairline bg-background/95 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-start justify-between border-b hairline p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-aurora-violet to-aurora-cyan text-background">
                  <Sparkles className="size-4" />
                </span>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-aurora-cyan">{eyebrow}</p>
                  <h2 className="mt-0.5 text-lg font-semibold text-foreground">{title}</h2>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="rounded-md p-1 text-muted-foreground hover:surface-1 hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-5">
              <div className="mb-3 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{done ? "Complete" : "Working…"}</span>
                <span className="font-mono text-aurora-cyan">{progress}%</span>
              </div>
              <div className="mb-4 h-1.5 overflow-hidden rounded-full surface-3">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-aurora-violet to-aurora-cyan"
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "linear", duration: 0.15 }}
                />
              </div>

              <ol className="space-y-1.5 text-sm">
                {log.map((line, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "flex items-center gap-2",
                      i === log.length - 1 && !done
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 shrink-0 rounded-full",
                        i === log.length - 1 && !done
                          ? "animate-pulse bg-aurora-cyan"
                          : "bg-aurora-emerald",
                      )}
                    />
                    {line}
                  </motion.li>
                ))}
              </ol>

              {done && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 rounded-xl border border-aurora-emerald/25 bg-aurora-emerald/8 p-4"
                >
                  <p className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                    <CheckCircle2 className="size-4 text-aurora-emerald" />
                    {result.headline}
                  </p>
                  <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                    {result.bullets.map((b, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-1 size-1 shrink-0 rounded-full bg-aurora-cyan" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  onClick={onClose}
                  className="rounded-lg border hairline surface-1 px-3 py-2 text-sm text-foreground hover:surface-2"
                >
                  {done ? "Close" : "Cancel"}
                </button>
                {done && result.ctaLabel && result.onCta && (
                  <AuroraButton
                    onClick={() => {
                      result.onCta?.();
                      onClose();
                    }}
                  >
                    {result.ctaLabel}
                  </AuroraButton>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}