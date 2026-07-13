type WinCounterBadgeProps = {
  current: number;
  total: number;
};

/** Prominent floating win counter pinned to the top of the screen. */
export default function WinCounterBadge({ current, total }: WinCounterBadgeProps) {
  const tone =
    current < 0
      ? 'text-red-300'
      : total > 0 && current > total
        ? 'text-orange-300'
        : total > 0 && current >= total
          ? 'text-amber-200'
          : 'text-white';

  return (
    <div className="pointer-events-none absolute top-3 left-1/2 z-30 -translate-x-1/2 select-none animate-fade-in">
      <div className="inline-flex items-center gap-2 rounded-full border-2 border-amber-300/60 bg-black/45 px-4 py-1.5 shadow-[0_4px_20px_rgba(251,191,36,0.35)] backdrop-blur-md">
        <span className="text-xl leading-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">🏆</span>
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-200/90">
          Win
        </span>
        <span
          className={`font-mono text-2xl font-black tabular-nums leading-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] ${tone}`}
        >
          {current}
          {total > 0 && <span className="text-base text-white/45">/{total}</span>}
        </span>
      </div>
    </div>
  );
}
