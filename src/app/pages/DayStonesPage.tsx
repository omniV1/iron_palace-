import { useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { useDayStones } from "../hooks/useDayStones";
import { DayStoneRecordBook } from "../components/DayStoneRecordBook";
import { DayStonesHeroImage } from "../components/DayStonesHeroImage";
import { DayStonesCelticDivider } from "../components/DayStonesCelticDivider";
import {
  CATEGORY_LABELS,
  DAY_STONES_HERO,
  DAY_STONES_TAGLINE_DETAIL,
  DAY_STONES_TITLE,
  DAY_STONES_WEIGHTS,
} from "../dayStones/constants";
import { splitByCategory } from "../dayStones/utils";
import imgNewLogo from "../../assets/feef32863d06775804f6af6bbe43f8df154b97b4.png?w=500&format=webp&quality=85";

export default function DayStonesPage() {
  const { entries, loading, error } = useDayStones();
  const { withStraps, withoutStraps } = splitByCategory(entries);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500&display=swap";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(217,119,6,0.06),transparent_50%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_80%_100%,rgba(5,150,105,0.04),transparent_40%)]" />

      <header className="relative border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-20 grid grid-cols-[1fr_auto_1fr] items-center">
          <a href="/" className="flex items-center gap-3 text-zinc-400 hover:text-amber-500 transition-colors justify-self-start">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">Back to site</span>
          </a>
          <a href="/" className="justify-self-center">
            <img src={imgNewLogo} alt="Iron Palace Podcast" className="h-12 w-auto" />
          </a>
          <div aria-hidden="true" />
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full text-center"
        >
          <p className="text-amber-500/80 text-xs uppercase tracking-[0.35em] mb-4">Record Books</p>
          <h1
            className="text-4xl md:text-5xl font-light tracking-wide uppercase mb-8"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            {DAY_STONES_TITLE}
          </h1>

          <DayStonesHeroImage src={DAY_STONES_HERO.src} alt={DAY_STONES_HERO.alt} className="mb-8" />

          <div className="mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg">
            {DAY_STONES_WEIGHTS.map(({ label, sublabel }) => (
              <div
                key={label}
                className="px-4 py-2 rounded-lg border border-amber-600/40 bg-amber-950/20 ring-1 ring-amber-600/10 text-center"
              >
                <p className="text-amber-500 font-medium text-sm uppercase tracking-wider">{label}</p>
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest mt-0.5">{sublabel}</p>
              </div>
            ))}
          </div>

          <p className="text-zinc-500 text-sm max-w-xl mx-auto leading-relaxed mt-6">{DAY_STONES_TAGLINE_DETAIL}</p>
        </motion.div>

        <DayStonesCelticDivider />

        {loading && <p className="text-zinc-400 text-sm text-center">Loading…</p>}
        {error && <p className="text-red-400 text-sm text-center">Couldn't load record books: {error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <DayStoneRecordBook
              title={CATEGORY_LABELS.straps}
              category="straps"
              entries={withStraps}
              variant="full"
              animate
            />
            <DayStoneRecordBook
              title={CATEGORY_LABELS.no_straps}
              category="no_straps"
              entries={withoutStraps}
              variant="full"
              animate
            />
          </div>
        )}
      </main>
    </div>
  );
}
