import type { ReactNode } from "react";
import { cn } from "./ui/utils";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  accent?: boolean;
};

export function GlassCard({ children, className, hover = false, accent = false }: GlassCardProps) {
  return (
    <div
      className={cn(
        "bg-card backdrop-blur-md border border-border-subtle rounded-2xl",
        hover && "hover:border-border-gold transition-colors",
        accent && "relative overflow-hidden",
        className
      )}
    >
      {accent && (
        <div className="pointer-events-none absolute left-3 right-3 top-0 h-px bg-gradient-to-r from-transparent via-gold-bright/45 to-transparent" />
      )}
      {children}
    </div>
  );
}
