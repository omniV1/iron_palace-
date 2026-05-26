import { GlassCard } from "./GlassCard";
import { DAY_STONES_WEIGHTS } from "../dayStones/constants";

export function DayStonesWeightGrid({ className = "mt-8" }: { className?: string }) {
  return (
    <div className={`mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg ${className}`}>
      {DAY_STONES_WEIGHTS.map(({ label, sublabel }) => (
        <GlassCard key={label} className="px-4 py-3 text-center hover:border-border-gold transition-colors">
          <p className="text-gold font-medium text-sm uppercase tracking-wider font-display">{label}</p>
          <p className="text-muted-foreground text-[10px] uppercase tracking-widest mt-0.5 font-display">
            {sublabel}
          </p>
        </GlassCard>
      ))}
    </div>
  );
}
