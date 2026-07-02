import type { Transition, Variants } from "motion/react";

/**
 * Shared animation language for the whole site — one easing curve, one
 * duration scale, reused everywhere instead of ad-hoc per-section tuning.
 * The curve is a gentle "ease-out-expo" feel: quick to start, soft landing.
 */
export const EASE = [0.16, 1, 0.3, 1] as const;

export const DURATION = {
  fast: 0.25,
  base: 0.45,
  slow: 0.7,
} as const;

export const springSnappy: Transition = {
  type: "spring",
  stiffness: 320,
  damping: 28,
  mass: 0.9,
};

export const springSoft: Transition = {
  type: "spring",
  stiffness: 220,
  damping: 26,
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DURATION.base, ease: EASE } },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE } },
};

export const fadeInUpSm: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: DURATION.fast, ease: EASE } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: DURATION.base, ease: EASE } },
};

/** Wrap a list container with this, then give each child `fadeInUp` (or similar) — children stagger automatically. */
export const staggerContainer = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: stagger,
      delayChildren,
    },
  },
});

/** Standard "reveal on scroll" props — spread onto a motion.* element. */
export const revealProps = {
  initial: "hidden" as const,
  whileInView: "show" as const,
  viewport: { once: true, margin: "-80px" },
};

/** Standard hover-lift for card-like surfaces. */
export const cardHover = {
  whileHover: { y: -4, transition: springSoft },
  whileTap: { y: -1, scale: 0.99, transition: springSnappy },
};

/** Standard press feedback for buttons/icon-buttons. */
export const tapScale = {
  whileHover: { scale: 1.02, transition: springSoft },
  whileTap: { scale: 0.96, transition: springSnappy },
};

export const tapScaleSm = {
  whileHover: { scale: 1.06, transition: springSoft },
  whileTap: { scale: 0.92, transition: springSnappy },
};
