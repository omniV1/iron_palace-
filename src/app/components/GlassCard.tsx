import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "./ui/utils";
import { springSoft, springSnappy } from "../motion/variants";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  accent?: boolean;
};

export function GlassCard({ children, className, hover = false, accent = false }: GlassCardProps) {
  const Comp = hover ? motion.div : "div";
  const interactionProps = hover
    ? {
        whileHover: { y: -4, transition: springSoft },
        whileTap: { y: -1, scale: 0.995, transition: springSnappy },
      }
    : {};

  return (
    <Comp
      {...interactionProps}
      className={cn(
        "bg-card border border-border-subtle rounded-[var(--radius-card)] shadow-[var(--shadow-card)]",
        hover &&
          "transition-[box-shadow,border-color] duration-300 ease-out hover:border-border-crimson hover:shadow-[var(--shadow-card-hover)]",
        accent && "relative overflow-hidden",
        className
      )}
    >
      {accent && (
        <div className="pointer-events-none absolute left-3 right-3 top-0 h-px bg-gradient-to-r from-transparent via-crimson-bright/50 to-transparent" />
      )}
      {children}
    </Comp>
  );
}
