import { motion } from "motion/react";
import { ArrowLeft, Dumbbell } from "lucide-react";
import { useDayStones } from "../hooks/useDayStones";
import type { DayStoneEntry } from "../api";
import imgNewLogo from "../../assets/feef32863d06775804f6af6bbe43f8df154b97b4.png?w=500&format=webp&quality=85";

function RecordBook({
  title,
  entries,
}: {
  title: string;
  entries: DayStoneEntry[];
}) {
  return (
    <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-amber-600/10 p-2.5 rounded-lg ring-1 ring-amber-600/20">
          <Dumbbell className="w-5 h-5 text-amber-500" />
        </div>
        <h2 className="text-xl md:text-2xl font-light uppercase tracking-wider">{title}</h2>
      </div>

      {entries.length === 0 ? (
        <p className="text-zinc-500 text-sm">No lifters recorded yet.</p>
      ) : (
        <ul className="space-y-4">
          {entries.map((entry, index) => (
            <motion.li
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border-b border-white/5 pb-4 last:border-0 last:pb-0"
            >
              <p className="font-medium text-lg">{entry.name}</p>
              <p className="text-zinc-400 text-sm mt-0.5">{entry.liftedAt}</p>
              {entry.notes && (
                <p className="text-zinc-500 text-sm mt-1 whitespace-pre-line">{entry.notes}</p>
              )}
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function DayStonesPage() {
  const { entries, loading, error } = useDayStones();

  const withStraps = entries.filter((e) => e.category === "straps");
  const withoutStraps = entries.filter((e) => e.category === "no_straps");

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 text-zinc-400 hover:text-amber-500 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">Back to site</span>
          </a>
          <a href="/" className="absolute left-1/2 -translate-x-1/2">
            <img src={imgNewLogo} alt="Iron Palace Podcast" className="h-12 w-auto" />
          </a>
          <div className="w-24" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-light tracking-wide uppercase mb-4">The Day Stones</h1>
          <p className="text-zinc-400 text-sm max-w-xl mx-auto">
            Two stones weighing 454 lbs and 356 lbs — 810 lbs total. These record books honor those who have lifted them.
          </p>
        </motion.div>

        {loading && <p className="text-zinc-400 text-sm text-center">Loading…</p>}
        {error && <p className="text-red-400 text-sm text-center">Couldn't load record books: {error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <RecordBook title="With Straps" entries={withStraps} />
            <RecordBook title="Without Straps" entries={withoutStraps} />
          </div>
        )}
      </main>
    </div>
  );
}
