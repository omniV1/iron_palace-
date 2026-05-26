import type { DayStoneEntry } from "../api";
import { PREVIEW_ENTRIES_PER_BOOK } from "./constants";

export function splitByCategory(entries: DayStoneEntry[]) {
  return {
    withStraps: entries.filter((e) => e.category === "straps"),
    withoutStraps: entries.filter((e) => e.category === "no_straps"),
  };
}

export function previewEntries(entries: DayStoneEntry[]) {
  return mostRecentEntries(entries, PREVIEW_ENTRIES_PER_BOOK);
}

export function mostRecentEntries(entries: DayStoneEntry[], limit = PREVIEW_ENTRIES_PER_BOOK) {
  return [...entries]
    .sort((a, b) => {
      const aTime = Date.parse(a.liftedAt);
      const bTime = Date.parse(b.liftedAt);
      if (Number.isFinite(aTime) && Number.isFinite(bTime)) return bTime - aTime;
      if (Number.isFinite(bTime)) return 1;
      if (Number.isFinite(aTime)) return -1;
      return b.liftedAt.localeCompare(a.liftedAt);
    })
    .slice(0, limit);
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}
