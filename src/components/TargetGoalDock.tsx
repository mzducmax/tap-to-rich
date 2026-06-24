/**
 * Bottom HUD — large balance & target, compact meta row.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { useMemo, type RefObject } from 'react';
import {
  getNegativeProgressPercent,
  getPositiveProgressPercent,
  hasReachedLoseTarget,
  hasReachedWinTarget,
} from '../games/stickman-bomb/background/config/targetLimits';
import { scoreToEstateLevel } from '../games/stickman-bomb/estate/config/estateConfig';
import type { EstateLevel } from '../games/stickman-bomb/estate/config/estateConfig';
import type { WeaponMode } from '../games/stickman-bomb/gameplay/config/weaponSettings';

type TargetGoalDockProps = {
  score: number;
  targetScore: number;
  winCurrent?: number;
  winTotal?: number;
  showWin?: boolean;
  weaponMode?: WeaponMode;
  hasBorrowed?: boolean;
  shellRef?: RefObject<HTMLDivElement | null>;
};

/** Font size from longest value so both columns stay in sync and fit side-by-side. */
function heroFontSize(charLen: number): string {
  if (charLen <= 6) return 'clamp(1.85rem, 9vw, 3rem)';
  if (charLen <= 8) return 'clamp(1.55rem, 7.5vw, 2.45rem)';
  if (charLen <= 10) return 'clamp(1.25rem, 6vw, 1.95rem)';
  if (charLen <= 12) return 'clamp(1.05rem, 5vw, 1.55rem)';
  if (charLen <= 14) return 'clamp(0.9rem, 4.2vw, 1.3rem)';
  if (charLen <= 16) return 'clamp(0.78rem, 3.6vw, 1.1rem)';
  return 'clamp(0.68rem, 3vw, 0.95rem)';
}

function formatLevelBadgeLabel(level: EstateLevel): string {
  return `Level ${level}`;
}

function levelBadgeClass(level: number, isWin: boolean, isLose: boolean): string {
  if (isLose) return 'border-red-300/50 bg-red-500/25 text-red-100';
  if (isWin) return 'border-emerald-300/50 bg-emerald-500/25 text-emerald-100';
  if (level < 0) return 'border-rose-300/45 bg-rose-500/20 text-rose-100';
  if (level > 0) return 'border-amber-300/45 bg-amber-500/20 text-amber-100';
  return 'border-white/35 bg-white/15 text-white/90';
}

export default function TargetGoalDock({
  score,
  targetScore,
  winCurrent = 0,
  winTotal = 0,
  showWin = false,
  weaponMode = 'hammer',
  hasBorrowed = false,
  shellRef,
}: TargetGoalDockProps) {
  const isGun = weaponMode === 'gun';
  const negPct = getNegativeProgressPercent(score, targetScore);
  const posPct = getPositiveProgressPercent(score, targetScore);
  const isWin = hasReachedWinTarget(score, targetScore);
  const isLose = hasReachedLoseTarget(score, targetScore);
  const showWinStat = showWin && winTotal > 0;

  const isNeg = score < 0;
  const isZero = score === 0;
  const sign = isNeg ? '−' : score > 0 ? '+' : '';
  const scoreDigits = Math.abs(score).toLocaleString('en-US');
  const targetDigits = Math.abs(targetScore).toLocaleString('en-US');
  const scoreText = `${sign}${scoreDigits}$`;
  const targetText = `${targetScore < 0 ? '−' : ''}${targetDigits}$`;
  const scoreLen = scoreText.length;
  const targetLen = targetText.length;
  const heroLen = Math.max(scoreLen, targetLen);
  const heroSize = heroFontSize(heroLen);
  const useCompactLayout = heroLen > 12;

  const scoreClass = isLose
    ? 'text-red-300'
    : isWin
      ? 'text-emerald-300'
      : isNeg
        ? 'text-rose-300'
        : isZero
          ? 'text-white/50'
          : 'text-amber-200';

  const shellClass = isLose
    ? 'border-red-400/30 bg-red-500/10'
    : isWin
      ? 'border-emerald-400/30 bg-emerald-500/10'
      : 'border-white/20 bg-white/10';

  const winTone =
    winCurrent < 0 ? 'text-red-300' :
    winTotal > 0 && winCurrent > winTotal ? 'text-orange-300' :
    winTotal > 0 && winCurrent >= winTotal ? 'text-amber-200' :
    'text-white/75';

  const hasMeta = showWinStat || isWin || isLose || hasBorrowed;
  const activeLevel = useMemo(
    () => scoreToEstateLevel(score, targetScore),
    [score, targetScore],
  );

  return (
    <div
      ref={shellRef}
      className={`relative w-full overflow-visible rounded-xl border backdrop-blur-md shadow-lg transition-colors duration-300 ${shellClass}`}
      aria-label="Score and goal progress"
    >
      <div
        className={`absolute top-0 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border px-4 py-1 text-sm font-black uppercase tracking-wide shadow-lg backdrop-blur-sm sm:text-base sm:px-5 sm:py-1.5 ${levelBadgeClass(activeLevel, isWin, isLose)}`}
        aria-label={formatLevelBadgeLabel(activeLevel)}
      >
        {formatLevelBadgeLabel(activeLevel)}
      </div>

      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        <span className="text-sm leading-none opacity-85" aria-label={isGun ? 'Gun' : 'Hammer'}>
          {isGun ? '🔫' : '🔨'}
        </span>
      </div>

      <div className="overflow-hidden rounded-xl">
      <div
        className={`grid gap-x-3 px-3 pb-2 sm:gap-x-4 sm:px-4 ${
          useCompactLayout
            ? 'grid-cols-1 gap-y-2 pt-5'
            : 'grid-cols-2 pt-5'
        }`}
      >
        <div className="min-w-0 overflow-hidden">
          <p className="mb-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-white/50">
            Balance
          </p>
          <p
            className={`max-w-full truncate font-mono font-black tabular-nums leading-none tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] ${scoreClass}`}
            style={{ fontSize: heroSize }}
            title={scoreText}
          >
            {sign}
            <span className="font-black">{scoreDigits}</span>
            <span className={`ml-0.5 font-black ${scoreClass}`}>$</span>
          </p>
        </div>

        <div className={`min-w-0 overflow-hidden ${useCompactLayout ? '' : 'text-right'}`}>
          <p className="mb-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-white/50">
            Target
          </p>
          <p
            className={`max-w-full truncate font-mono font-black tabular-nums leading-none tracking-tight text-white/90 drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)] ${useCompactLayout ? '' : 'text-right'}`}
            style={{ fontSize: heroSize }}
            title={targetText}
          >
            {targetScore < 0 ? '−' : ''}
            {targetDigits}
            <span className="ml-0.5 font-black text-white/90">$</span>
          </p>
        </div>
      </div>

      {hasMeta && (
        <div className="flex flex-wrap items-center justify-center gap-2 px-3 pb-2 text-[10px] font-black tracking-wider">
          {hasBorrowed && (
            <span className="shrink-0 rounded-md border border-rose-400/50 bg-rose-500/25 px-1.5 py-0.5 text-[9px] uppercase text-rose-200">
              Borrow
            </span>
          )}

          {showWinStat && (
            <span className={`font-mono tabular-nums ${winTone}`}>
              WIN {winCurrent}
              <span className="text-white/30">/{winTotal}</span>
            </span>
          )}

          {(isWin || isLose) && (
            <span
              className={`rounded-md px-1.5 py-0.5 text-[9px] uppercase ${
                isLose ? 'bg-red-500/20 text-red-200' : 'bg-emerald-500/20 text-emerald-200'
              }`}
            >
              {isLose ? 'Fail' : 'Win'}
            </span>
          )}
        </div>
      )}

      <div className="flex h-1.5">
        <div className="relative w-1/2 bg-white/5">
          <div
            className={`absolute inset-y-0 right-0 transition-[width] duration-300 ease-out ${
              isLose ? 'bg-red-400/90' : 'bg-rose-400/75'
            }`}
            style={{ width: `${negPct}%` }}
          />
        </div>
        <div className="w-px shrink-0 bg-white/25" aria-hidden />
        <div className="relative w-1/2 bg-white/5">
          <div
            className={`absolute inset-y-0 left-0 transition-[width] duration-300 ease-out ${
              isWin ? 'bg-emerald-400/90' : 'bg-amber-400/80'
            }`}
            style={{ width: `${posPct}%` }}
          />
        </div>
      </div>
      </div>
    </div>
  );
}
