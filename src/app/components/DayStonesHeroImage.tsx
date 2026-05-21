import { motion } from "motion/react";

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
      className={`relative w-full max-w-md sm:max-w-xl mx-auto ${className}`}
    >
      <div className="relative rounded-2xl overflow-hidden border border-amber-600/20 shadow-[0_24px_60px_rgba(0,0,0,0.5)] ring-1 ring-white/5 bg-black">
        <img
          src={src}
          alt={alt}
          className="block w-full h-auto"
          loading="eager"
          decoding="async"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
      </div>
    </motion.figure>
  );
}
