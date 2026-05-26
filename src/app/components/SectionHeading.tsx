import type { ReactNode } from "react";
import { cn } from "./ui/utils";

type SectionHeadingProps = {
  title: string;
  subtitle?: string;
  className?: string;
  children?: ReactNode;
};

export function SectionHeading({ title, subtitle, className, children }: SectionHeadingProps) {
  return (
    <div className={cn("text-center mb-12", className)}>
      <h2 className="font-display text-3xl md:text-4xl font-light tracking-wide uppercase mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted-foreground text-sm">{subtitle}</p>
      )}
      {children}
    </div>
  );
}
