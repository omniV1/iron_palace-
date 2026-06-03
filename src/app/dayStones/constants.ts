import type { DayStoneEntry } from "../api";
import imgDayStonesHero from "../../assets/day-stones/setup-hero.png?w=1200&format=webp&quality=85";

export const DAY_STONES_TITLE = "The Day Stones";

export const DAY_STONES_TOTAL_LBS = 810;

export const DAY_STONES_HERO = {
  src: imgDayStonesHero,
  alt: "The Day Stones on the Iron Palace setup",
} as const;

export const DAY_STONES_PREVIEW_LEAD = `The Day Stones are two stones, ${DAY_STONES_TOTAL_LBS} pounds combined.`;

export const DAY_STONES_PREVIEW_DETAIL =
  "When someone gets them off the ground, their name goes in the record book. Lifts with straps and lifts without straps are logged separately.";

export const DAY_STONES_TAGLINE = "454 lbs and 356 lbs.";

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
  { border: string; glow: string; label: string; portrait: string }
> = {
  straps: {
    border: "border-t-zinc-500/40",
    glow: "shadow-[0_0_32px_rgba(0,0,0,0.2)]",
    label: "text-foreground/90",
    portrait: "ring-border-subtle bg-surface text-muted-foreground",
  },
  no_straps: {
    border: "border-t-gold",
    glow: "shadow-[0_0_32px_rgba(220,38,38,0.15)]",
    label: "text-gold",
    portrait: "ring-gold/30 bg-gold-muted text-gold",
  },
};
