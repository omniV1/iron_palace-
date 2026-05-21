export function DayStonesCelticDivider({ className = "my-10" }: { className?: string }) {
  return (
    <div
      className={`w-full max-w-lg mx-auto flex items-center justify-center gap-3 ${className}`}
      aria-hidden="true"
    >
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-600/40" />
      <div className="w-2 h-2 shrink-0 rotate-45 border border-amber-500/50" />
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-600/40" />
    </div>
  );
}
