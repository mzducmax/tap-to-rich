/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
/** Small buffer added after the last bird's computed exit time before stopping wave audio/state. */
export const BIRD_EXIT_BUFFER_MS = 300;
export const SPLAT_LIFETIME_MS = 2_400;
export const SPLAT_FADE_MS = 700;

/** Time window for the full flock (stagger + last bird exit). */
export const BIRD_FLOCK_DURATION_MS = (() => {
  const maxDelay = (BIRD_COUNT_MAX - 1) * (280 + 360) + 200;
  const maxCross = BIRD_CROSSING_MS + 900;
  return maxDelay + maxCross + 400;
})();

export type BirdPhase = 'idle' | 'crossing';
