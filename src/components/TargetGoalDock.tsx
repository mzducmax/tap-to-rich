/**
 * Bottom HUD — large balance & target, compact meta row.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { useMemo, type CSSProperties, type RefObject } from 'react';
import {
  CornerFlourish,
  CrestOrnament,
} from '../games/stickman-bomb/background/components/LevelOrnaments';
import { getLevelTheme } from '../games/stickman-bomb/background/config/levelTheme';
import type { LevelTheme } from '../games/stickman-bomb/background/config/levelTheme';
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

const WIN_BADGE_THEME: LevelTheme = {
  accent: '#34d399',
  deep: '#065f46',
  glow: 'rgba(52, 211, 153, 0.55)',
  text: '#d1fae5',
};

const LOSE_BADGE_THEME: LevelTheme = {
  accent: '#f87171',
  deep: '#7f1d1d',
  glow: 'rgba(248, 113, 113, 0.55)',
  text: '#fee2e2',
};

/** Tier-colored pill — glow scales with |level| so deeper tiers read stronger. */
function levelBadgeStyle(theme: LevelTheme, depth: number): CSSProperties {
  return {
    background: `linear-gradient(135deg, ${theme.deep} 0%, ${theme.accent}44 100%)`,
    borderColor: theme.accent,
    color: theme.text,
    boxShadow: `0 0 ${10 + depth * 4}px ${theme.glow}, 0 4px 12px rgba(0, 0, 0, 0.35)`,
  };
}

/** Tier pips — filled count = |level| on the positive (5) or negative (6) ladder. */
function LevelTierPips({ level, theme }: { level: EstateLevel; theme: LevelTheme }) {
  const pipCount = level < 0 ? 6 : 5;
  const filled = Math.abs(level);
  return (
    <span className="flex items-center gap-0.75" aria-hidden>
      {Array.from({ length: pipCount }, (_, i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full transition-colors duration-300"
          style={
            i < filled
              ? { background: theme.accent, boxShadow: `0 0 4px ${theme.glow}` }
              : { background: 'rgba(255, 255, 255, 0.22)' }
          }
        />
      ))}
    </span>
  );
}

export default function TargetGoalDock({
  score,
  targetScore,
  weaponMode = 'hammer',
  hasBorrowed = false,
  shellRef,
}: TargetGoalDockProps) {
  const isGun = weaponMode === 'gun';
  const negPct = getNegativeProgressPercent(score, targetScore);
  const posPct = getPositiveProgressPercent(score, targetScore);
  const isWin = hasReachedWinTarget(score, targetScore);
  const isLose = hasReachedLoseTarget(score, targetScore);

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

  const hasMeta = isWin || isLose || hasBorrowed;
  const activeLevel = useMemo(
    () => scoreToEstateLevel(score, targetScore),
    [score, targetScore],
  );
  const badgeTheme = isLose
    ? LOSE_BADGE_THEME
    : isWin
      ? WIN_BADGE_THEME
      : getLevelTheme(activeLevel);
  const tier = Math.abs(activeLevel);

  /* Panel is the tier frame: accent border + glow scale with |level|. */
  const shellStyle: CSSProperties = {
    borderColor: `${badgeTheme.accent}99`,
    background: `linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, ${badgeTheme.deep}40 100%)`,
    boxShadow: `0 4px 20px rgba(0, 0, 0, 0.35), 0 0 ${12 + tier * 4}px ${badgeTheme.glow}`,
  };

  return (
    <div
      ref={shellRef}
      className="relative w-full overflow-visible rounded-xl border-2 backdrop-blur-md transition-all duration-500"
      style={shellStyle}
      aria-label="Score and goal progress"
    >
      {/* Tier ornaments — crest along the top edge (badge covers center) + corner flourishes */}
      <div className="pointer-events-none absolute inset-0 z-10" aria-hidden>
        <CrestOrnament
          tier={tier}
          accent={badgeTheme.accent}
          glow={badgeTheme.glow}
          className="absolute inset-x-8 -top-1.5 h-3"
        />
        <CornerFlourish
          tier={tier}
          accent={badgeTheme.accent}
          glow={badgeTheme.glow}
          className="absolute -top-1 -left-1 h-6 w-6"
        />
        <CornerFlourish
          tier={tier}
          accent={badgeTheme.accent}
          glow={badgeTheme.glow}
          className="absolute -top-1 -right-1 h-6 w-6 -scale-x-100"
        />
        <CornerFlourish
          tier={tier}
          accent={badgeTheme.accent}
          glow={badgeTheme.glow}
          className="absolute -bottom-1 -left-1 h-6 w-6 -scale-y-100"
        />
        <CornerFlourish
          tier={tier}
          accent={badgeTheme.accent}
          glow={badgeTheme.glow}
          className="absolute -bottom-1 -right-1 h-6 w-6 -scale-100"
        />
      </div>
      <div
        className="absolute top-0 left-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border px-4 py-1 text-sm font-black uppercase tracking-wide backdrop-blur-sm transition-all duration-500 sm:px-5 sm:py-1.5 sm:text-base"
        style={levelBadgeStyle(badgeTheme, Math.abs(activeLevel))}
        aria-label={formatLevelBadgeLabel(activeLevel)}
      >
        <span className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
          {formatLevelBadgeLabel(activeLevel)}
        </span>
        <LevelTierPips level={activeLevel} theme={badgeTheme} />
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
