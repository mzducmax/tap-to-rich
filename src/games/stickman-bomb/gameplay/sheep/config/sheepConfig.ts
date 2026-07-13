/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** Base duration for each sheep's cross animation. */
export const SHEEP_CROSSING_MS = 6_500;
/** Auto-spawn interval between sheep herd waves. */
export const SHEEP_WAVE_INTERVAL_MS = 10_000;

export const SHEEP_BASE_COUNT = 12;
/** Extra rear sheep as a fraction of the base flock (extends depth). */
export const SHEEP_REAR_EXTRA_RATIO = 0.3;
export const SHEEP_COUNT = Math.round(SHEEP_BASE_COUNT * (1 + SHEEP_REAR_EXTRA_RATIO));

export const SHEEP_REWARD = 5;
export const SHEEP_PINK_REWARD = 10;
export const SHEEP_GOLD_REWARD = 30;
export const SHEEP_BLACK_PENALTY = 10;
/** Gold sheep per wave (fixed). */
export const SHEEP_GOLD_COUNT = 2;
/** Pink sheep per wave (fixed). */
export const SHEEP_PINK_COUNT = 4;
/** Min/max black sheep per wave (inclusive). */
export const SHEEP_BLACK_MIN = 4;
export const SHEEP_BLACK_MAX = 5;
export const SHEEP_HIT_PADDING = 14;

/** Flock container band — shifted down to free upper screen. */
export const SHEEP_FLOCK_TOP_PERCENT = 14;
export const SHEEP_FLOCK_BOTTOM_PERCENT = 2;
/** Front-band vertical layout within the flock container. */
export const SHEEP_SPAWN_CENTER_Y = 58;
export const SHEEP_SPAWN_SPREAD_Y = 32;
export const SHEEP_SPAWN_CLUSTER_AMP = 10;
/** Rear-band vertical layout (trailing depth). */
export const SHEEP_REAR_TOP_START = 52;
export const SHEEP_REAR_TOP_RANGE = 38;
export const SHEEP_REAR_SPREAD_Y = 20;

export type SheepDirection = 'ltr' | 'rtl';
export type SheepVariant = 'white' | 'gold' | 'pink' | 'black';

/** Worst-case time until the last sheep fully exits the screen. */
export const SHEEP_WAVE_DURATION_MS = (() => {
  const maxDelay = (SHEEP_COUNT - 1) * (140 + 90) + 60;
  const maxDuration = SHEEP_CROSSING_MS + 450;
  return maxDelay + maxDuration + 300;
})();

export type SheepPhase = 'idle' | 'crossing';

export function getSheepHitDelta(variant: SheepVariant): number {
  switch (variant) {
    case 'gold':
      return SHEEP_GOLD_REWARD;
    case 'pink':
      return SHEEP_PINK_REWARD;
    case 'black':
      return -SHEEP_BLACK_PENALTY;
    default:
      return SHEEP_REWARD;
  }
}
