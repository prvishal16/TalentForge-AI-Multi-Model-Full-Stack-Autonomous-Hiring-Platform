import { ChevronLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";

export function BackToHome() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed left-4 top-4 z-50 sm:left-6 sm:top-6"
    >
      <Link
        to="/"
        className="group inline-flex items-center gap-2 rounded-full border hairline surface-1 px-3.5 py-2 text-xs font-medium text-muted-foreground backdrop-blur-md transition-all hover:hairline-strong hover:surface-2 hover:text-foreground hover:shadow-elev-2 sm:text-sm"
      >
        <ChevronLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
        Back to Home
      </Link>
    </motion.div>
  );
}