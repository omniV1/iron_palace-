import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "./ui/utils";
import { fadeInUpSm } from "../motion/variants";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export function PageShell({ children, className }: PageShellProps) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={fadeInUpSm}
      className={cn("min-h-screen bg-background text-foreground", className)}
    >
      {children}
    </motion.div>
  );
}
