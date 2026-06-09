/**
 * Unified bottom HUD — target score, optional win counter, goal progress bar.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import type { CSSProperties } from 'react';
import {
  getNegativeProgressPercent,
  getPositiveProgressPercent,
  getTargetProgressPercent,
  hasReachedLoseTarget,
  hasReachedWinTarget,
} from '../games/stickman-bomb/background/config/targetLimits';
import { formatCounterLabel } from '../games/stickman-bomb/gameplay/logic/formatCounterDisplay';
import type { WeaponMode } from '../games/stickman-bomb/gameplay/config/weaponSettings';

type TargetGoalDockProps = {
  score: number;
  targetScore: number;
  winCurrent?: number;
  winTotal?: number;
  showWin?: boolean;
  weaponMode?: WeaponMode;
};

const BAR_STRIPE: CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(255,255,255,0.12) 6px, rgba(255,255,255,0.12) 7px)',
};

export default function TargetGoalDock({
  score,
  targetScore,
  winCurrent = 0,
  winTotal = 0,
  showWin = false,
  weaponMode = 'hammer',
}: TargetGoalDockProps) {
  const isGun = weaponMode === 'gun';
  const progress = getTargetProgressPercent(score, targetScore);
  const negativeProgress = getNegativeProgressPercent(score, targetScore);
  const positiveProgress = getPositiveProgressPercent(score, targetScore);
  const isWinComplete = hasReachedWinTarget(score, targetScore);
  const isLoseComplete = hasReachedLoseTarget(score, targetScore);
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
              isLoseComplete
                ? 'bg-red-500/25 text-red-200'
                : isWinComplete
                  ? 'bg-emerald-500/25 text-emerald-200'
                  : 'bg-amber-400/15 text-amber-200'
            }`}
            aria-hidden
          >
            {isLoseComplete ? '✕' : isWinComplete ? '✓' : '🎯'}
          </span>
          <div className="min-w-0 leading-none">
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/45">
              Target
            </p>
            <p className="mt-0.5 font-black tabular-nums tracking-tight text-white">
              <span className="text-lg">{formatCounterLabel(score)}</span>
              <span className="text-[11px] font-bold text-white/45"> / {formatCounterLabel(targetScore)}</span>
            </p>
          </div>
        </div>

        <div className="h-8 w-px shrink-0 bg-white/10" aria-hidden />

        <div className="shrink-0 text-center leading-none">
          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/45">
            Weapon
          </p>
          <p className="mt-0.5 font-black text-white whitespace-nowrap">
            <span className="text-sm" aria-hidden>
              {isGun ? '🔫' : '🔨'}
            </span>
            <span className="ml-0.5 text-[11px] tracking-tight">
              {isGun ? 'Gun' : 'Hammer'}
            </span>
          </p>
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
            {isLoseComplete ? 'Fail' : isWinComplete ? 'Done' : 'Goal'}
          </p>
          <p
            className={`mt-0.5 text-sm font-black tabular-nums ${
              isLoseComplete
                ? 'text-red-300'
                : isWinComplete
                  ? 'text-emerald-300'
                  : 'text-amber-200'
            }`}
          >
            {isLoseComplete || isWinComplete
              ? '100%'
              : `${Math.round(progress)}%`}
          </p>
        </div>
      </div>

      <div className="relative flex h-2">
        <div className="relative w-1/2 bg-white/6">
          <div
            className={`absolute inset-y-0 right-0 transition-all duration-500 ease-out bg-gradient-to-l from-rose-200 via-red-500 to-red-900 ${
              isLoseComplete || negativeProgress >= 100
                ? 'shadow-[0_0_14px_rgba(248,113,113,0.55)] animate-pulse'
                : ''
            }`}
            style={{ width: `${negativeProgress}%` }}
          />
          <div className="absolute inset-0 opacity-30" style={BAR_STRIPE} aria-hidden />
        </div>

        <div
          className="absolute left-1/2 top-0 bottom-0 z-10 w-px -translate-x-1/2 bg-white/35"
          aria-hidden
        />

        <div className="relative w-1/2 bg-white/8">
          <div
            className={`absolute inset-y-0 left-0 transition-all duration-500 ease-out ${
              isWinComplete
                ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300 shadow-[0_0_14px_rgba(52,211,153,0.55)]'
                : 'bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400'
            } ${isWinComplete ? 'animate-pulse' : ''}`}
            style={{ width: `${positiveProgress}%` }}
          />
          <div className="absolute inset-0 opacity-30" style={BAR_STRIPE} aria-hidden />
        </div>
      </div>
    </div>
  );
}
