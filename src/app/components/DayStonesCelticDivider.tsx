import { motion } from "motion/react";
import { fadeIn, revealProps } from "../motion/variants";

export function DayStonesCelticDivider({ className = "my-10" }: { className?: string }) {
  return (
    <motion.div
      variants={fadeIn}
      {...revealProps}
      className={`w-full max-w-lg mx-auto flex items-center justify-center gap-3 ${className}`}
      aria-hidden="true"
    >
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-crimson/40" />
      <div className="w-2 h-2 shrink-0 rotate-45 border border-crimson/50" />
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-crimson/40" />
    </motion.div>
  );
}
