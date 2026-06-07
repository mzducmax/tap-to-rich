/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BIRD_DELAY_AFTER_SHEEP_MS, GAMEPLAY_CYCLE_MS } from '../../config/gameplayCycle';
import { SHEEP_WARNING_MS, SHEEP_WAVE_DURATION_MS } from '../../sheep/config/sheepConfig';

export const BIRD_INTERVAL_MS = GAMEPLAY_CYCLE_MS;
export const BIRD_COUNT_MIN = 16;
export const BIRD_COUNT_MAX = 22;
export const BIRD_POOP_PENALTY = 10;
export const BIRD_SHOOT_REWARD = 10;
export const BIRD_HIT_PADDING = 18;
/** Bird center must reach this band around screen middle before pooping. */
export const BIRD_POOP_CENTER_HALF_BAND = 0.22;
/** Extra horizontal reach when checking bird vs counter for poop drops. */
export const BIRD_POOP_COUNTER_PAD_X = 72;
export const BIRD_CROSSING_MS = 5_800;
export const SPLAT_LIFETIME_MS = 2_400;
export const SPLAT_FADE_MS = 700;

/** Time window for the full flock (stagger + last bird exit). */
export const BIRD_FLOCK_DURATION_MS = (() => {
  const maxDelay = (BIRD_COUNT_MAX - 1) * (280 + 360) + 200;
  const maxCross = BIRD_CROSSING_MS + 900;
  return maxDelay + maxCross + 400;
})();

export type BirdPhase = 'idle' | 'crossing';

export function getBirdPhase(elapsedMs: number): BirdPhase {
  const cyclePos = elapsedMs % BIRD_INTERVAL_MS;
  const sheepCrossingEnd = SHEEP_WARNING_MS + SHEEP_WAVE_DURATION_MS;

  if (cyclePos < sheepCrossingEnd) return 'idle';

  const flockStart = SHEEP_WARNING_MS + BIRD_DELAY_AFTER_SHEEP_MS;
  const flockEnd = flockStart + BIRD_FLOCK_DURATION_MS;

  if (cyclePos >= flockStart && cyclePos < flockEnd) return 'crossing';
  return 'idle';
}
