import { motion } from "motion/react";
import { cn } from "./ui/utils";
import { DayStonesFramedImage } from "./DayStonesFramedImage";

type Props = {
  src: string;
  alt: string;
  className?: string;
};

export function DayStonesHeroImage({ src, alt, className = "" }: Props) {
  return (
    <motion.figure
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={cn("relative w-full max-w-md sm:max-w-xl mx-auto", className)}
    >
      <DayStonesFramedImage src={src} alt={alt} loading="eager" />
    </motion.figure>
  );
}
