import type { DayStoneEntry } from "../api";
import { PREVIEW_ENTRIES_PER_BOOK } from "./constants";

export function splitByCategory(entries: DayStoneEntry[]) {
  return {
    withStraps: entries.filter((e) => e.category === "straps"),
    withoutStraps: entries.filter((e) => e.category === "no_straps"),
  };
}

export function previewEntries(entries: DayStoneEntry[]) {
  return entries.slice(-PREVIEW_ENTRIES_PER_BOOK).reverse();
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}
