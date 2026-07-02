import type { LucideIcon } from "lucide-react";
import { cn } from "./ui/utils";

type IconWellProps = {
  icon: LucideIcon;
  className?: string;
  size?: "sm" | "md";
};

export function IconWell({ icon: Icon, className, size = "md" }: IconWellProps) {
  return (
    <div
      className={cn(
        "bg-crimson-muted rounded-xl ring-1 ring-crimson/20 shrink-0 transition-colors duration-300 group-hover:bg-crimson/20 group-hover:ring-crimson/35",
        size === "sm" ? "p-2 rounded-lg" : "p-3",
        className
      )}
    >
      <Icon className={cn("text-crimson-bright", size === "sm" ? "w-5 h-5" : "w-6 h-6")} />
    </div>
  );
}

/** Shared form input styling for admin and public forms */
export const inputClassName =
  "mt-1 w-full bg-input-background border border-border-subtle rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground transition-colors duration-200 focus:outline-none focus:border-border-crimson focus:ring-2 focus:ring-crimson/15";

export const labelClassName =
  "block text-xs uppercase tracking-wider text-muted-foreground font-display";
