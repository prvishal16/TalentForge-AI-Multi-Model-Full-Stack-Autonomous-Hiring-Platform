import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Subtle Linear/Vercel-style product announcement pill.
 * Not a marketing banner. Sits above headings.
 */
export function AnnouncementBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.span
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border hairline surface-1 px-2.5 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur-md",
        className,
      )}
    >
      <span className="relative grid place-items-center">
        <span className="absolute size-1.5 rounded-full bg-aurora-cyan/60 blur-[3px]" />
        <span className="relative size-1.5 rounded-full bg-aurora-cyan" />
      </span>
      {children}
    </motion.span>
  );
}