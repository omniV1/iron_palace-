import { motion } from "motion/react";
import type { DayStoneEntry } from "../api";
import { CATEGORY_ACCENTS, PREVIEW_ENTRIES_PER_BOOK, type DayStoneCategory } from "../dayStones/constants";
import { DayStoneEntryCard } from "./DayStoneEntryCard";
import { GlassCard } from "./GlassCard";
import { cn } from "./ui/utils";

type Props = {
  title: string;
  category: DayStoneCategory;
  entries: DayStoneEntry[];
  variant: "compact" | "full" | "teaser";
  totalCount?: number;
  animate?: boolean;
};

function TeaserSlots({ entries, accentDot }: { entries: DayStoneEntry[]; accentDot: string }) {
  return (
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
  );
}

export function DayStoneRecordBook({ title, category, entries, variant, totalCount, animate = false }: Props) {
  const isFull = variant === "full";
  const isTeaser = variant === "teaser";
  const accent = CATEGORY_ACCENTS[category];
  const count = totalCount ?? entries.length;

  return (
    <GlassCard
      accent
      hover
      className={cn(
        "flex flex-col p-6 md:p-8 border-t-2",
        isTeaser && "h-full min-h-[280px]",
        accent.border,
        accent.glow,
      )}
    >
      <div className="mb-6 flex items-baseline justify-between gap-3">
        <h2
          className={cn(
            "font-display font-light uppercase tracking-wider",
            accent.label,
            isFull ? "text-xl md:text-2xl" : "text-lg",
          )}
        >
          {title}
        </h2>
        {count > 0 && (
          <span className="shrink-0 font-display text-[10px] uppercase tracking-widest text-muted-foreground">
            {count} {count === 1 ? "lifter" : "lifters"}
          </span>
        )}
      </div>

      {isTeaser ? (
        <>
          {count === 0 && (
            <p className="mb-4 text-center text-muted-foreground text-sm">No lifts logged yet.</p>
          )}
          <TeaserSlots
            entries={entries}
            accentDot={category === "no_straps" ? "bg-gold" : "bg-zinc-400"}
          />
          <p className="mt-4 text-center font-display text-[10px] uppercase tracking-widest text-muted-foreground/70">
            Recent lifts — see names in the record book
          </p>
        </>
      ) : entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-subtle bg-input-background/50 py-8 text-center">
          <p className="text-muted-foreground text-sm">No lifters recorded yet.</p>
          <p className="mt-1 font-display text-xs uppercase tracking-wider text-muted-foreground/70">
            Names appear here once logged
          </p>
        </div>
      ) : (
        <div className={isFull ? "space-y-1" : "space-y-3"} role="list">
          {entries.map((entry, index) =>
            animate ? (
              <motion.div
                key={entry.id}
                role="listitem"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <DayStoneEntryCard entry={entry} variant={variant} category={category} />
              </motion.div>
            ) : (
              <div key={entry.id} role="listitem">
                <DayStoneEntryCard entry={entry} variant={variant} category={category} />
              </div>
            ),
          )}
        </div>
      )}
    </GlassCard>
  );
}
