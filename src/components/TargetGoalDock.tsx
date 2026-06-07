/**
 * Unified bottom HUD — target score, optional win counter, goal progress bar.
 * @license SPDX-License-Identifier: Apache-2.0
 */

type TargetGoalDockProps = {
  score: number;
  targetScore: number;
  winCurrent?: number;
  winTotal?: number;
  showWin?: boolean;
};

export default function TargetGoalDock({
  score,
  targetScore,
  winCurrent = 0,
  winTotal = 0,
  showWin = false,
}: TargetGoalDockProps) {
  const clampedScore = Math.min(score, targetScore);
  const progress = Math.min(100, targetScore > 0 ? (score / targetScore) * 100 : 0);
  const isComplete = score >= targetScore;
  const showWinStat = showWin && winTotal > 0;

  const winOver = winTotal > 0 && winCurrent > winTotal;
  const winUnder = winCurrent < 0;
  const winAtGoal = winTotal > 0 && winCurrent >= winTotal && winCurrent <= winTotal;

  return (
    <div
      className="w-full rounded-2xl border border-white/15 bg-black/35 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)] overflow-hidden"
      aria-label="Target and goal progress"
    >
      <div className="flex items-center justify-between gap-3 px-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm ${
              isComplete
                ? 'bg-emerald-500/25 text-emerald-200'
                : 'bg-amber-400/15 text-amber-200'
            }`}
            aria-hidden
          >
            {isComplete ? '✓' : '🎯'}
          </span>
          <div className="min-w-0 leading-none">
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/45">
              Target
            </p>
            <p className="mt-0.5 font-black tabular-nums tracking-tight text-white">
              <span className="text-lg">{clampedScore}</span>
              <span className="text-[11px] font-bold text-white/45"> / {targetScore}</span>
            </p>
          </div>
        </div>

        {showWinStat && (
          <>
            <div className="h-8 w-px shrink-0 bg-white/10" aria-hidden />
            <div className="text-right leading-none shrink-0">
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-amber-300/70">
                Win
              </p>
              <p className="mt-0.5 font-black tabular-nums tracking-tight">
                <span
                  className={`text-lg ${
                    winUnder
                      ? 'text-red-400'
                      : winOver
                        ? 'text-orange-300'
                        : winAtGoal
                          ? 'text-amber-200'
                          : 'text-white'
                  }`}
                >
                  {winCurrent}
                </span>
                <span className="text-[11px] font-bold text-white/45"> / {winTotal}</span>
              </p>
            </div>
          </>
        )}

        <div className="ml-auto shrink-0 text-right leading-none pl-1">
          <p className="text-[8px] font-black uppercase tracking-[0.15em] text-white/40">
            {isComplete ? 'Done' : 'Goal'}
          </p>
          <p
            className={`mt-0.5 text-sm font-black tabular-nums ${
              isComplete ? 'text-emerald-300' : 'text-amber-200'
            }`}
          >
            {isComplete ? '100%' : `${Math.round(progress)}%`}
          </p>
        </div>
      </div>

      <div className="relative h-2 bg-white/8">
        <div
          className={`absolute inset-y-0 left-0 transition-all duration-500 ease-out ${
            isComplete
              ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300 shadow-[0_0_14px_rgba(52,211,153,0.55)]'
              : 'bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400'
          } ${isComplete ? 'animate-pulse' : ''}`}
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(255,255,255,0.12) 6px, rgba(255,255,255,0.12) 7px)',
          }}
          aria-hidden
        />
      </div>
    </div>
  );
}
