/**
 * Key [O] — a gold nugget is tossed up, falls into the house,
 * bursts into sparks, then rewards +$20.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const BUTTERFLY_REWARD = 20;
export const BUTTERFLY_REWARD_LABEL = `+$${BUTTERFLY_REWARD.toLocaleString('en-US')}`;

export const BUTTERFLY_SPAWN_COOLDOWN_MS = 110;
export const BUTTERFLY_SPAWN_MAX_CONCURRENT = 18;

/** Gold nugget sprite size (px). */
export const BUTTERFLY_SIZE = 88;

/** Toss arc — gravity + approximate air time to the house. */
export const GOLD_NUGGET_GRAVITY = 2100;
export const GOLD_NUGGET_TOSS_TIME_MS = 1050;

export const BUTTERFLY_BURST_MS = 720;

/** Canvas compositor — cap device pixel ratio for GPU memory. */
export const GOLD_NUGGET_RENDER_DPR = 1.5;

/** Impact particle pool size (shared across all concurrent nuggets). */
export const GOLD_NUGGET_MAX_HIT_PARTICLES = 72;
