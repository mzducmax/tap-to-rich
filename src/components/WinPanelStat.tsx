type WinPanelStatProps = {
  current: number;
  total: number;
};

/** Compact win counter for the score panel (may exceed goal or go negative). */
export default function WinPanelStat({ current, total }: WinPanelStatProps) {
  const isOverGoal = total > 0 && current > total;
  const isUnderZero = current < 0;
  const isAtGoal = total > 0 && current >= total && current <= total;

  return (
    <div className="text-center min-w-[64px]">
      <p className="text-[9px] font-black uppercase tracking-widest text-amber-300">WIN</p>
      <div className="flex items-baseline justify-center gap-1">
        <span
          className={`text-2xl font-black tabular-nums tracking-tighter drop-shadow-sm ${
            isUnderZero
              ? 'text-red-400'
              : isOverGoal
                ? 'text-orange-300'
                : isAtGoal
                  ? 'text-amber-200'
                  : 'text-white'
          }`}
        >
          {current}
        </span>
        <span className="text-[10px] font-bold text-white/60">/ {total}</span>
      </div>
    </div>
  );
}
