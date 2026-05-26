import { motion } from "motion/react";
import { cn } from "./ui/utils";
import { GlassCard } from "./GlassCard";

type Props = {
  src: string;
  alt: string;
  className?: string;
};

export function DayStonesHeroImage({ src, alt, className = "" }: Props) {
  return (
    <motion.figure
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={cn("relative w-full max-w-md sm:max-w-xl mx-auto", className)}
    >
      <GlassCard accent className="overflow-hidden p-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
        <div className="relative rounded-xl overflow-hidden">
          <img
            src={src}
            alt={alt}
            className="block w-full h-auto"
            loading="eager"
            decoding="async"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background/80 to-transparent" />
        </div>
      </GlassCard>
    </motion.figure>
  );
}
