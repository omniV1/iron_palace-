import { cn } from "./ui/utils";
import { GlassCard } from "./GlassCard";

type Props = {
  src: string;
  alt: string;
  className?: string;
  onError?: () => void;
  loading?: "lazy" | "eager";
};

export function DayStonesFramedImage({ src, alt, className, onError, loading = "lazy" }: Props) {
  return (
    <GlassCard accent className={cn("overflow-hidden p-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.5)]", className)}>
      <div className="relative rounded-xl overflow-hidden">
        <img
          src={src}
          alt={alt}
          className="block w-full h-auto"
          loading={loading}
          decoding="async"
          onError={onError}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background/80 to-transparent" />
      </div>
    </GlassCard>
  );
}
