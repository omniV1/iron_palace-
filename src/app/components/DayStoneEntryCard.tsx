import { useState, type ReactNode } from "react";
import type { DayStoneEntry } from "../api";
import { CATEGORY_ACCENTS, CATEGORY_LABELS, type DayStoneCategory } from "../dayStones/constants";
import { getInitials } from "../dayStones/utils";
import { cn } from "./ui/utils";

type Variant = "compact" | "full" | "admin";

type Props = {
  entry: DayStoneEntry;
  variant?: Variant;
  category?: DayStoneCategory;
  actions?: ReactNode;
};

function Portrait({
  entry,
  size,
  portraitClass,
}: {
  entry: DayStoneEntry;
  size: "sm" | "md";
  portraitClass: string;
}) {
  const [broken, setBroken] = useState(false);
  const dim = size === "sm" ? "w-12 h-12 text-sm" : "w-16 h-16 text-base";
  const initials = getInitials(entry.name);

  if (entry.photoUrl && !broken) {
    return (
      <img
        src={entry.photoUrl}
        alt={entry.name}
        loading="lazy"
        decoding="async"
        onError={() => setBroken(true)}
        className={cn(dim, "rounded-lg object-cover shrink-0 ring-1", portraitClass)}
      />
    );
  }

  return (
    <div
      className={cn(
        dim,
        "rounded-lg shrink-0 flex items-center justify-center font-medium ring-1",
        portraitClass,
      )}
      aria-hidden={!!entry.photoUrl}
    >
      {initials || "?"}
    </div>
  );
}

export function DayStoneEntryCard({ entry, variant = "full", category = entry.category, actions }: Props) {
  const [notesExpanded, setNotesExpanded] = useState(false);
  const hasLongNotes = !!(entry.notes && entry.notes.length > 120);
  const portraitClass = CATEGORY_ACCENTS[category].portrait;

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-3 border-b border-border-subtle pb-3 last:border-0 last:pb-0">
        <Portrait entry={entry} size="sm" portraitClass={portraitClass} />
        <div className="min-w-0">
          <p className="font-display font-medium truncate">{entry.name}</p>
          <p className="text-muted-foreground text-xs tabular-nums">{entry.liftedAt}</p>
        </div>
      </div>
    );
  }

  if (variant === "admin") {
    return (
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 bg-input-background border border-border-subtle rounded-xl p-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <Portrait entry={entry} size="sm" portraitClass={portraitClass} />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{entry.name}</p>
            <p className="text-muted-foreground text-xs tabular-nums">{entry.liftedAt}</p>
            <p className="text-muted-foreground/70 text-xs">{CATEGORY_LABELS[entry.category]}</p>
            {entry.notes && (
              <p className="text-muted-foreground text-xs mt-1 line-clamp-2 whitespace-pre-line">{entry.notes}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end shrink-0">
            {actions}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="group flex items-start gap-4 border-b border-border-subtle pb-4 last:border-0 last:pb-0 rounded-lg px-2 -mx-2 transition-colors hover:bg-white/[0.02]">
      <Portrait entry={entry} size="md" portraitClass={portraitClass} />
      <div className="min-w-0 flex-1">
        <p className="font-display font-medium text-lg group-hover:text-gold-bright/95 transition-colors">{entry.name}</p>
        <p className="text-muted-foreground text-sm mt-0.5 tabular-nums">{entry.liftedAt}</p>
        {entry.notes && (
          <>
            <p
              className={`text-muted-foreground/80 text-sm mt-1 whitespace-pre-line ${
                notesExpanded ? "" : "line-clamp-2"
              }`}
            >
              {entry.notes}
            </p>
            {hasLongNotes && (
              <button
                type="button"
                onClick={() => setNotesExpanded((v) => !v)}
                className="text-gold/80 hover:text-gold-bright text-xs mt-1 uppercase tracking-wider font-display"
              >
                {notesExpanded ? "Show less" : "Read more"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
