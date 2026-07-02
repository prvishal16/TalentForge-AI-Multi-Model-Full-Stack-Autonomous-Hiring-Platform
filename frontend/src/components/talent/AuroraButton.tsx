import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

export const AuroraButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement>
>(function AuroraButton({ className, children, ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg px-4 py-2 text-sm font-semibold text-background",
        "bg-gradient-to-r from-aurora-violet via-aurora-indigo to-aurora-cyan",
        "shadow-[0_8px_24px_-8px_var(--color-aurora-violet)] transition-all duration-300",
        "hover:brightness-110 hover:shadow-[0_10px_30px_-8px_var(--color-aurora-cyan)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full"
      />
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </button>
  );
});