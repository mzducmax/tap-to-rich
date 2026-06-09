/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GAMEPLAY_CYCLE_MS, GAMEPLAY_INITIAL_DELAY_MS } from '../../config/gameplayCycle';

export const SHEEP_INTERVAL_MS = GAMEPLAY_CYCLE_MS;
export const SHEEP_WARNING_MS = 2_000;
/** Base duration for each sheep's cross animation. */
export const SHEEP_CROSSING_MS = 5_000;
export const SHEEP_REWARD = 5;
export const SHEEP_COUNT = 12;
export const SHEEP_HIT_PADDING = 14;

/** Worst-case time until the last sheep fully exits the screen. */
export const SHEEP_WAVE_DURATION_MS = (() => {
  const maxDelay = (SHEEP_COUNT - 1) * (140 + 90) + 60;
  const maxDuration = SHEEP_CROSSING_MS + 450;
  return maxDelay + maxDuration + 300;
})();

export type SheepPhase = 'idle' | 'warning' | 'crossing';

export function getSheepPhase(elapsedMs: number): SheepPhase {
  if (elapsedMs < GAMEPLAY_INITIAL_DELAY_MS) return 'idle';

  const cyclePos = (elapsedMs - GAMEPLAY_INITIAL_DELAY_MS) % SHEEP_INTERVAL_MS;

  if (cyclePos < SHEEP_WARNING_MS) return 'warning';
  if (cyclePos < SHEEP_WARNING_MS + SHEEP_WAVE_DURATION_MS) return 'crossing';
  return 'idle';
}
