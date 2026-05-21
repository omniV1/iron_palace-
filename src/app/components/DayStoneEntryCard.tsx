import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { DayStoneEntry } from "../api";
import { CATEGORY_LABELS } from "../dayStones/constants";
import { getInitials } from "../dayStones/utils";

type Variant = "compact" | "full" | "admin";

type Props = {
  entry: DayStoneEntry;
  variant?: Variant;
  actions?: React.ReactNode;
};

type PhotoSize = "thumb" | "preview" | "feature";

function LifterPhoto({
  entry,
  size,
  className = "",
}: {
  entry: DayStoneEntry;
  size: PhotoSize;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);
  const initials = getInitials(entry.name);
  const hasPhoto = !!(entry.photoUrl && !broken);

  const sizeClasses: Record<PhotoSize, string> = {
    thumb: "w-12 h-12 text-sm rounded-lg",
    preview: "w-24 sm:w-28 aspect-[3/4] text-lg rounded-lg",
    feature: "w-full aspect-[4/5] text-4xl rounded-none",
  };

  const imgClasses: Record<PhotoSize, string> = {
    thumb: "object-cover",
    preview: "object-cover object-top",
    feature: "object-cover object-top",
  };

  if (hasPhoto) {
    return (
      <img
        src={entry.photoUrl}
        alt={entry.name}
        loading="lazy"
        decoding="async"
        onError={() => setBroken(true)}
        className={`${sizeClasses[size]} ${imgClasses[size]} shrink-0 ring-1 ring-amber-600/20 bg-zinc-800 ${className}`}
      />
    );
  }

  if (size === "feature") {
    return (
      <div
        className={`${sizeClasses[size]} shrink-0 flex flex-col items-center justify-center bg-gradient-to-b from-zinc-800/80 to-zinc-950 ring-1 ring-amber-600/15 ${className}`}
        aria-label={`${entry.name}, photo pending`}
      >
        <span className="text-amber-500/80 font-medium">{initials || "?"}</span>
        <span className="text-zinc-600 text-[10px] uppercase tracking-widest mt-2">Photo pending</span>
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} shrink-0 flex items-center justify-center bg-amber-950/40 ring-1 ring-amber-600/30 text-amber-500/90 font-medium ${className}`}
      aria-hidden={!!entry.photoUrl}
    >
      {initials || "?"}
    </div>
  );
}

export function DayStoneEntryCard({ entry, variant = "full", actions }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0">
        <LifterPhoto entry={entry} size="thumb" />
        <div className="min-w-0">
          <p className="font-medium truncate">{entry.name}</p>
          <p className="text-zinc-400 text-xs">{entry.liftedAt}</p>
        </div>
      </div>
    );
  }

  if (variant === "admin") {
    return (
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 bg-black/40 border border-white/5 rounded-xl p-3">
        <LifterPhoto entry={entry} size="preview" className="mx-auto sm:mx-0" />
        <div className="flex-1 min-w-0 w-full">
          <p className="font-medium">{entry.name}</p>
          <p className="text-zinc-400 text-xs mt-0.5">{entry.liftedAt}</p>
          <p className="text-zinc-500 text-xs">{CATEGORY_LABELS[entry.category]}</p>
          {entry.notes && (
            <p className="text-zinc-400 text-xs mt-1 line-clamp-2 whitespace-pre-line">{entry.notes}</p>
          )}
          {actions && (
            <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-white/5">
              {actions}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <article className="overflow-hidden rounded-xl border border-white/10 bg-black/25 shadow-md shadow-black/20 transition-colors hover:border-amber-600/20">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="w-full flex items-center gap-3 p-3 sm:p-4 text-left transition-colors hover:bg-white/[0.03]"
      >
        <LifterPhoto entry={entry} size="thumb" />
        <div className="min-w-0 flex-1">
          <p className="font-medium uppercase tracking-wide truncate">{entry.name}</p>
          <p className="text-zinc-400 text-sm tabular-nums">{entry.liftedAt}</p>
        </div>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-zinc-500 transition-transform duration-200 ${
            expanded ? "rotate-180 text-amber-500/80" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {expanded && (
        <div className="border-t border-white/10">
          <LifterPhoto entry={entry} size="feature" />
          {entry.notes && (
            <div className="p-4 sm:p-5">
              <p className="text-zinc-500 text-sm whitespace-pre-line leading-relaxed">{entry.notes}</p>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
