import { motion } from "motion/react";
import { SectionHeading } from "./SectionHeading";
import { CollapsiblePanel } from "./CollapsiblePanel";
import { DayStonesHeroImage } from "./DayStonesHeroImage";
import { DayStonesWeightGrid } from "./DayStonesWeightGrid";
import { DayStonesCelticDivider } from "./DayStonesCelticDivider";
import { fadeInUp, revealProps } from "../motion/variants";
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
      <div className="text-center">
        <SectionHeading
          eyebrow={isPage ? "Record Books" : undefined}
          title={DAY_STONES_TITLE}
          subtitle={isPage ? DAY_STONES_TAGLINE : DAY_STONES_PREVIEW_LEAD}
          className={isPage ? "mb-8" : "mb-0"}
        />

        {isPage ? (
          <motion.div variants={fadeInUp} {...revealProps}>
            <CollapsiblePanel
              label="The setup"
              hint="Tap to view the stones"
              className="mb-6 max-w-xl mx-auto text-left"
            >
              <DayStonesHeroImage
                src={DAY_STONES_HERO.src}
                alt={DAY_STONES_HERO.alt}
              />
            </CollapsiblePanel>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto leading-relaxed">
              {DAY_STONES_TAGLINE_DETAIL}
            </p>
            <DayStonesWeightGrid />
          </motion.div>
        ) : (
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto leading-relaxed mt-3">
            {DAY_STONES_PREVIEW_DETAIL}
          </p>
        )}
      </div>

      {isPage && <DayStonesCelticDivider />}
    </>
  );
}
