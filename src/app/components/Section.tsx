import type { ReactNode } from "react";
import { cn } from "./ui/utils";

type SectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  variant?: "default" | "elevated";
};

export function Section({ id, children, className, variant = "default" }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "py-20 px-4",
        variant === "elevated" ? "bg-surface" : "bg-background",
        className
      )}
    >
      {children}
    </section>
  );
}
