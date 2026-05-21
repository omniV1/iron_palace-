import { motion } from "motion/react";
import type { DayStoneEntry } from "../api";
import { CATEGORY_ACCENTS, type DayStoneCategory } from "../dayStones/constants";
import { DayStoneEntryCard } from "./DayStoneEntryCard";

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
    <div
      className={`rounded-2xl p-6 md:p-8 border border-white/10 border-t-2 ${accent.border} ${accent.glow} ${
        isFull
          ? "bg-stone-900/50 [border-image:linear-gradient(90deg,rgba(34,84,61,0.35),rgba(217,119,6,0.45),rgba(34,84,61,0.35))_1] [border-image-slice:1]"
          : "bg-zinc-900/60 backdrop-blur-md"
      }`}
    >
      <div className="flex items-baseline justify-between gap-3 mb-6">
        <h2
          className={`font-light uppercase tracking-wider ${accent.label} ${
            isFull ? "text-xl md:text-2xl" : "text-lg"
          }`}
        >
          {title}
        </h2>
        {entries.length > 0 && (
          <span className="text-zinc-600 text-[10px] uppercase tracking-widest shrink-0">
            {entries.length} {entries.length === 1 ? "lifter" : "lifters"}
          </span>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="py-8 text-center border border-dashed border-white/10 rounded-xl bg-black/20">
          <p className="text-zinc-500 text-sm">No lifters recorded yet.</p>
          <p className="text-zinc-600 text-xs mt-1">Names appear here once logged.</p>
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
                <DayStoneEntryCard entry={entry} variant={variant} />
              </motion.div>
            ) : (
              <div key={entry.id} role="listitem">
                <DayStoneEntryCard entry={entry} variant={variant} />
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
