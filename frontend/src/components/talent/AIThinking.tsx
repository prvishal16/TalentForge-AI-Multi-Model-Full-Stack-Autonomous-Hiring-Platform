import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

export function AIThinking({ label = "Analyzing" }: { label?: string }) {
  return (
    <div className="inline-flex items-center gap-2.5 rounded-full border hairline surface-1 px-3 py-1.5 backdrop-blur-md">
      <div className="relative size-4">
        <motion.div
          className="absolute inset-0 rounded-full bg-aurora-violet/60 blur-[6px]"
          animate={{ opacity: [0.4, 0.9, 0.4], scale: [1, 1.2, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
        <Sparkles className="relative size-4 text-aurora-cyan" />
      </div>
      <span className="text-xs font-medium text-foreground/90">{label}</span>
      <span className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="size-1 rounded-full bg-aurora-cyan"
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </span>
    </div>
  );
}

export function AINeuralLoader() {
  return (
    <div className="relative flex h-40 items-center justify-center">
      <motion.div
        className="absolute size-32 rounded-full bg-aurora-violet/30 blur-3xl"
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.div
        className="absolute size-24 rounded-full bg-aurora-cyan/40 blur-2xl"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
      />
      <div className="relative z-10 flex flex-col items-center gap-3">
        <AIThinking label="AI is thinking" />
        <p className="max-w-xs text-center text-xs text-muted-foreground">
          Scanning resume, extracting skills, matching against 12 open roles…
        </p>
      </div>
    </div>
  );
}