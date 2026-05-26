import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "./ui/utils";

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
        "border border-border-subtle rounded-xl overflow-hidden",
        compact ? "w-full sm:min-w-[10rem]" : "w-full",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={`${panelId}-panel`}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-white/[0.02] transition-colors"
      >
        <span className="min-w-0">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-display block">{label}</span>
          {hint && !open && (
            <span className="text-muted-foreground text-[10px] truncate block mt-0.5">{hint}</span>
          )}
        </span>
        <ChevronDown
          className={cn("w-4 h-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div id={`${panelId}-panel`} className="px-3 pb-3 pt-1 border-t border-border-subtle">
          {children}
        </div>
      )}
    </div>
  );
}
