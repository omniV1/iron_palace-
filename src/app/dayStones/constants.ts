import type { DayStoneEntry } from "../api";
import imgDayStonesHero from "../../assets/day-stones/setup-hero.png?w=1200&format=webp&quality=85";

export const DAY_STONES_TITLE = "The Day Stones";

export const DAY_STONES_TOTAL_LBS = 810;

export const DAY_STONES_HERO = {
  src: imgDayStonesHero,
  alt: "The Day Stones on the Iron Palace setup",
} as const;

/** Home page — what the Day Stones are */
export const DAY_STONES_PREVIEW_LEAD = `The Day Stones are two stones, ${DAY_STONES_TOTAL_LBS} pounds combined.`;

/** Home page — what the record books are and how they're split */
export const DAY_STONES_PREVIEW_DETAIL =
  "When someone gets them off the ground, their name goes in the record book. Lifts with straps and lifts without straps are logged separately.";

/** Full /day-stones page — individual stone weights */
export const DAY_STONES_TAGLINE = "454 lbs and 356 lbs.";

/** Full /day-stones page — how the books are organized */
export const DAY_STONES_TAGLINE_DETAIL =
  "The record books below are split: with straps in one, without in the other.";

export const DAY_STONES_WEIGHTS = [
  { label: "454 lbs", sublabel: "Stone one" },
  { label: "356 lbs", sublabel: "Stone two" },
  { label: "810 lbs total", sublabel: "Combined" },
] as const;

export const CATEGORY_LABELS: Record<DayStoneEntry["category"], string> = {
  straps: "With Straps",
  no_straps: "Without Straps",
};

export const PREVIEW_ENTRIES_PER_BOOK = 3;

export const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

export type DayStoneCategory = DayStoneEntry["category"];

export const CATEGORY_ACCENTS: Record<
  DayStoneCategory,
  { border: string; glow: string; label: string }
> = {
  straps: {
    border: "border-t-amber-500/60",
    glow: "shadow-[0_0_40px_rgba(217,119,6,0.08)]",
    label: "text-amber-500/90",
  },
  no_straps: {
    border: "border-t-emerald-600/50",
    glow: "shadow-[0_0_40px_rgba(5,150,105,0.08)]",
    label: "text-emerald-500/90",
  },
};
