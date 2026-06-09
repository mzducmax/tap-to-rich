/**
 * Score-based backgrounds — positive L0–L5, negative L1–L6 (score 0 = L0).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import negativeLevel1Url from '../assets/levels/-level-1.png';
import negativeLevel2Url from '../assets/levels/-level-2.png';
import negativeLevel3Url from '../assets/levels/-level-3.png';
import negativeLevel4Url from '../assets/levels/-level-4.png';
import negativeLevel5Url from '../assets/levels/-level-5.png';
import negativeLevel6Url from '../assets/levels/-level-6.png';
import level0BackgroundUrl from '../assets/levels/level0.png';
import level1BackgroundUrl from '../assets/levels/level1.png';
import level2BackgroundUrl from '../assets/levels/level2.png';
import level3BackgroundUrl from '../assets/levels/level3.png';
import level4BackgroundUrl from '../assets/levels/level4.png';
import level5BackgroundUrl from '../assets/levels/level5.png';
import {
  clampTargetScore,
  DEFAULT_TARGET_SCORE,
} from './targetLimits';

export const POSITIVE_LEVEL_COUNT = 6;
export const NEGATIVE_LEVEL_COUNT = 6;

/** Reference: |target| split across positive/negative steps. */
export const REFERENCE_TARGET_FOR_LEVELS = 1_000_000;

/** L0 + L1–L5 (positive) + L-1–L-6 (negative). */
export type BackgroundLevel =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | -1
  | -2
  | -3
  | -4
  | -5
  | -6;

export const POSITIVE_BACKGROUND_LEVELS: BackgroundLevel[] = [0, 1, 2, 3, 4, 5];
export const NEGATIVE_BACKGROUND_LEVELS: BackgroundLevel[] = [
  -1, -2, -3, -4, -5, -6,
];

export const ALL_BACKGROUND_LEVELS: BackgroundLevel[] = [
  ...NEGATIVE_BACKGROUND_LEVELS.slice().reverse(),
  0,
  ...POSITIVE_BACKGROUND_LEVELS.filter((level) => level !== 0),
];

const POSITIVE_URLS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: level1BackgroundUrl,
  2: level2BackgroundUrl,
  3: level3BackgroundUrl,
  4: level4BackgroundUrl,
  5: level5BackgroundUrl,
};

const NEGATIVE_URLS: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
  1: negativeLevel1Url,
  2: negativeLevel2Url,
  3: negativeLevel3Url,
  4: negativeLevel4Url,
  5: negativeLevel5Url,
  6: negativeLevel6Url,
};

export function getLevelBackgroundUrl(level: BackgroundLevel): string {
  if (level === 0) return level0BackgroundUrl;
  if (level > 0) return POSITIVE_URLS[level];
  return NEGATIVE_URLS[Math.abs(level) as 1 | 2 | 3 | 4 | 5 | 6];
}

function getReferenceMagnitude(targetScore: number): number {
  const target = clampTargetScore(targetScore);
  return Math.abs(target) || DEFAULT_TARGET_SCORE;
}

export function scoreToBackgroundLevel(
  score: number,
  targetScore: number,
): BackgroundLevel {
  if (score === 0) return 0;

  const ref = getReferenceMagnitude(targetScore);

  if (score > 0) {
    const progress = Math.min(1, score / ref);
    const step = Math.max(1, Math.min(5, Math.ceil(progress * 5)));
    return step as BackgroundLevel;
  }

  const progress = Math.min(1, Math.abs(score) / ref);
  const step = Math.max(1, Math.min(6, Math.ceil(progress * 6)));
  return (-step) as BackgroundLevel;
}

export function formatLevelLabel(level: BackgroundLevel): string {
  if (level === 0) return 'L0';
  return `L${level}`;
}

function formatThresholdAmount(value: number): string {
  const sign = value < 0 ? '-' : '';
  return `${sign}${Math.abs(value).toLocaleString('en-US')}$`;
}

export function formatLevelThreshold(
  level: BackgroundLevel,
  targetScore: number,
): string {
  const ref = getReferenceMagnitude(targetScore);

  if (level === 0) return '0$';

  if (level > 0) {
    const step = ref / 5;
    const start = level === 1 ? 1 : Math.round((level - 1) * step);
    const end = Math.round(level * step);
    return `${formatThresholdAmount(start)} – ${formatThresholdAmount(end)}`;
  }

  const n = Math.abs(level);
  const step = ref / 6;
  const start = n === 1 ? -1 : -Math.round((n - 1) * step);
  const end = -Math.round(n * step);
  return `${formatThresholdAmount(start)} – ${formatThresholdAmount(end)}`;
}

export function getTargetLevelHint(targetScore: number): string {
  const ref = getReferenceMagnitude(targetScore);
  const posStep = Math.round(ref / 5);
  const negStep = Math.round(ref / 6);
  return `L0 at 0$. Positive L1–L5 (~${posStep.toLocaleString()}$ each). Negative L-1–L-6 (~${negStep.toLocaleString()}$ each). Based on |target| = ${ref.toLocaleString()}$.`;
}

/** @deprecated use ALL_BACKGROUND_LEVELS */
export const BACKGROUND_LEVELS = ALL_BACKGROUND_LEVELS;

/** @deprecated use POSITIVE_LEVEL_COUNT */
export const BACKGROUND_LEVEL_COUNT = POSITIVE_LEVEL_COUNT;
