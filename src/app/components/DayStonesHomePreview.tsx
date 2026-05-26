import type { DayStoneEntry } from "../api";
import {
  CATEGORY_ACCENTS,
  CATEGORY_LABELS,
  PREVIEW_ENTRIES_PER_BOOK,
  type DayStoneCategory,
} from "../dayStones/constants";
import { GlassCard } from "./GlassCard";
import { cn } from "./ui/utils";

type BookProps = {
  category: DayStoneCategory;
  entries: DayStoneEntry[];
  totalCount: number;
};

function TeaserBook({ category, entries, totalCount }: BookProps) {
  const accent = CATEGORY_ACCENTS[category];
  const title = CATEGORY_LABELS[category];
  const accentDot = category === "no_straps" ? "bg-gold" : "bg-zinc-400";

  return (
    <GlassCard
      accent
      hover
      className={cn(
        "flex h-full min-h-[280px] flex-col border-t-2 p-6 md:p-8",
        accent.border,
        accent.glow,
      )}
    >
      <div className="mb-6 flex items-baseline justify-between gap-3">
        <h2 className={cn("font-display text-lg font-light uppercase tracking-wider", accent.label)}>
          {title}
        </h2>
        {totalCount > 0 && (
          <span className="shrink-0 font-display text-[10px] uppercase tracking-widest text-muted-foreground">
            {totalCount} {totalCount === 1 ? "lifter" : "lifters"}
          </span>
        )}
      </div>

      {totalCount === 0 && (
        <p className="mb-4 text-center text-muted-foreground text-sm">No lifts logged yet.</p>
      )}

      <div className="flex flex-1 flex-col justify-end">
        {Array.from({ length: PREVIEW_ENTRIES_PER_BOOK }, (_, index) => {
          const entry = entries[index];
          if (entry) {
            return (
              <div
                key={entry.id}
                className="flex min-h-[3rem] items-center gap-3 border-b border-border-subtle py-3 last:border-0"
              >
                <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", accentDot)} aria-hidden />
                <span className="text-muted-foreground text-sm tabular-nums">{entry.liftedAt}</span>
              </div>
            );
          }
          return (
            <div
              key={`empty-${index}`}
              className="min-h-[3rem] border-b border-dashed border-border-subtle/40 py-3 last:border-0"
              aria-hidden
            />
          );
        })}
      </div>

      <p className="mt-4 text-center font-display text-[10px] uppercase tracking-widest text-muted-foreground/70">
        Recent lifts — see names in the record book
      </p>
    </GlassCard>
  );
}

type Props = {
  withStraps: DayStoneEntry[];
  withoutStraps: DayStoneEntry[];
  withStrapsTotal: number;
  withoutStrapsTotal: number;
};

export function DayStonesHomePreview({
  withStraps,
  withoutStraps,
  withStrapsTotal,
  withoutStrapsTotal,
}: Props) {
  return (
    <div className="mx-auto grid max-w-4xl grid-cols-1 items-stretch gap-6 md:grid-cols-2">
      <TeaserBook category="straps" entries={withStraps} totalCount={withStrapsTotal} />
      <TeaserBook category="no_straps" entries={withoutStraps} totalCount={withoutStrapsTotal} />
    </div>
  );
}
