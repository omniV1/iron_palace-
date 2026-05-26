import { motion } from "motion/react";
import type { DayStoneEntry } from "../api";
import { CATEGORY_ACCENTS, type DayStoneCategory } from "../dayStones/constants";
import { DayStoneEntryCard } from "./DayStoneEntryCard";
import { GlassCard } from "./GlassCard";
import { cn } from "./ui/utils";

type Props = {
  title: string;
  category: DayStoneCategory;
  entries: DayStoneEntry[];
  variant: "compact" | "full";
  animate?: boolean;
};

export function DayStoneRecordBook({ title, category, entries, variant, animate = false }: Props) {
  const isFull = variant === "full";
  const accent = CATEGORY_ACCENTS[category];

  return (
    <GlassCard
      accent
      hover
      className={cn(
        "p-6 md:p-8 border-t-2",
        accent.border,
        accent.glow,
      )}
    >
      <div className="flex items-baseline justify-between gap-3 mb-6">
        <h2
          className={cn(
            "font-display font-light uppercase tracking-wider",
            accent.label,
            isFull ? "text-xl md:text-2xl" : "text-lg",
          )}
        >
          {title}
        </h2>
        {entries.length > 0 && (
          <span className="text-muted-foreground text-[10px] uppercase tracking-widest shrink-0 font-display">
            {entries.length} {entries.length === 1 ? "lifter" : "lifters"}
          </span>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="py-8 text-center border border-dashed border-border-subtle rounded-xl bg-input-background/50">
          <p className="text-muted-foreground text-sm">No lifters recorded yet.</p>
          <p className="text-muted-foreground/70 text-xs mt-1 font-display uppercase tracking-wider">
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
