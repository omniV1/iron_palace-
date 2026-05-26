import { motion } from "motion/react";
import { SectionHeading } from "./SectionHeading";
import { DayStonesHeroImage } from "./DayStonesHeroImage";
import { DayStonesWeightGrid } from "./DayStonesWeightGrid";
import { DayStonesCelticDivider } from "./DayStonesCelticDivider";
import {
  DAY_STONES_HERO,
  DAY_STONES_PREVIEW_DETAIL,
  DAY_STONES_PREVIEW_LEAD,
  DAY_STONES_TAGLINE,
  DAY_STONES_TAGLINE_DETAIL,
  DAY_STONES_TITLE,
} from "../dayStones/constants";

type Props = {
  variant: "home" | "page";
};

export function DayStonesIntro({ variant }: Props) {
  const isPage = variant === "page";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isPage ? { opacity: 1, y: 0 } : undefined}
        whileInView={isPage ? undefined : { opacity: 1, y: 0 }}
        viewport={isPage ? undefined : { once: true }}
        className="text-center"
      >
        {isPage && (
          <p className="text-gold/80 text-xs uppercase tracking-[0.35em] mb-4 font-display">
            Record Books
          </p>
        )}

        <SectionHeading
          title={DAY_STONES_TITLE}
          subtitle={isPage ? DAY_STONES_TAGLINE : DAY_STONES_PREVIEW_LEAD}
          className={isPage ? "mb-8" : "mb-0"}
        />

        {isPage ? (
          <>
            <DayStonesHeroImage
              src={DAY_STONES_HERO.src}
              alt={DAY_STONES_HERO.alt}
              className="mb-6"
            />
            <p className="text-muted-foreground text-sm max-w-xl mx-auto leading-relaxed">
              {DAY_STONES_TAGLINE_DETAIL}
            </p>
            <DayStonesWeightGrid />
          </>
        ) : (
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto leading-relaxed mt-3">
            {DAY_STONES_PREVIEW_DETAIL}
          </p>
        )}
      </motion.div>

      {isPage && <DayStonesCelticDivider />}
    </>
  );
}
