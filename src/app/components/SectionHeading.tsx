import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "./ui/utils";
import { fadeInUp, revealProps } from "../motion/variants";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
  children?: ReactNode;
};

export function SectionHeading({ eyebrow, title, subtitle, className, children }: SectionHeadingProps) {
  return (
    <motion.div
      variants={fadeInUp}
      {...revealProps}
      className={cn("text-center mb-12 md:mb-14", className)}
    >
      {eyebrow && (
        <span className="inline-flex items-center gap-2 text-crimson-bright/90 text-xs uppercase tracking-[0.3em] font-display mb-3">
          <span className="h-1 w-1 rounded-full bg-crimson-bright" aria-hidden />
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-3xl md:text-[2.5rem] font-light leading-[1.15] tracking-wide uppercase mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto leading-relaxed">{subtitle}</p>
      )}
      {children}
    </motion.div>
  );
}
