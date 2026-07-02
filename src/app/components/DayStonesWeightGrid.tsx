import { motion } from "motion/react";
import { GlassCard } from "./GlassCard";
import { DAY_STONES_WEIGHTS } from "../dayStones/constants";
import { fadeInUpSm, revealProps, staggerContainer } from "../motion/variants";

export function DayStonesWeightGrid({ className = "mt-8" }: { className?: string }) {
  return (
    <motion.div
      variants={staggerContainer(0.08)}
      {...revealProps}
      className={`mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg ${className}`}
    >
      {DAY_STONES_WEIGHTS.map(({ label, sublabel }) => (
        <motion.div key={label} variants={fadeInUpSm}>
          <GlassCard hover className="px-4 py-3 text-center">
            <p className="text-crimson-bright font-medium text-sm uppercase tracking-wider font-display">{label}</p>
            <p className="text-muted-foreground text-[10px] uppercase tracking-widest mt-0.5 font-display">
              {sublabel}
            </p>
          </GlassCard>
        </motion.div>
      ))}
    </motion.div>
  );
}
