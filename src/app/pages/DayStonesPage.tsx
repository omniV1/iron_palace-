import { motion } from "motion/react";
import { useDayStones } from "../hooks/useDayStones";
import { DayStoneRecordBook } from "../components/DayStoneRecordBook";
import { DayStonesIntro } from "../components/DayStonesIntro";
import { PageShell } from "../components/PageShell";
import { SiteHeader } from "../components/SiteHeader";
import { CATEGORY_LABELS } from "../dayStones/constants";
import { splitByCategory } from "../dayStones/utils";

export default function DayStonesPage() {
  const { entries, loading, error } = useDayStones();
  const { withStraps, withoutStraps } = splitByCategory(entries);

  return (
    <PageShell>
      <SiteHeader />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <DayStonesIntro variant="page" />

        {loading && <p className="text-muted-foreground text-sm text-center mt-8">Loading…</p>}
        {error && (
          <p className="text-destructive text-sm text-center mt-8">Couldn't load record books: {error}</p>
        )}

        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
          >
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
          </motion.div>
        )}
      </main>
    </PageShell>
  );
}
