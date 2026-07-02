import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { cn } from "./ui/utils";
import { EASE } from "../motion/variants";

type Props = {
  label: string;
  hint?: string;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
  className?: string;
  compact?: boolean;
};

export function CollapsiblePanel({
  label,
  hint,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  children,
  className,
  compact = false,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const panelId = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div
      className={cn(
        "border border-border-subtle rounded-xl overflow-hidden bg-input-background/40 transition-colors hover:border-white/15",
        compact ? "w-full sm:min-w-[10rem]" : "w-full",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={`${panelId}-panel`}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-white/[0.03] transition-colors"
      >
        <span className="min-w-0">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-display block">{label}</span>
          {hint && !open && (
            <span className="text-muted-foreground text-[10px] truncate block mt-0.5">{hint}</span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-300 ease-out",
            open && "rotate-180 text-crimson-bright",
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            id={`${panelId}-panel`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 border-t border-border-subtle">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
