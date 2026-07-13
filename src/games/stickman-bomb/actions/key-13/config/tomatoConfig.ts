/**
 * Key [U] — a tomato is tossed up, splats into the house,
 * bursts into red pulp, then awards money.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const TOMATO_REWARD = 20;
export const TOMATO_REWARD_LABEL = `+$${TOMATO_REWARD.toLocaleString('en-US')}`;

export const TOMATO_SPAWN_COOLDOWN_MS = 110;
export const TOMATO_SPAWN_MAX_CONCURRENT = 18;

/** Tomato sprite size (px). */
export const TOMATO_SIZE = 88;

/** Toss arc — gravity + approximate air time to the house. */
export const TOMATO_GRAVITY = 2100;
export const TOMATO_TOSS_TIME_MS = 1050;

export const TOMATO_BURST_MS = 720;

/** Canvas compositor — cap device pixel ratio for GPU memory. */
export const TOMATO_RENDER_DPR = 1.5;

/** Impact particle pool size (shared across all concurrent tomatoes). */
export const TOMATO_MAX_HIT_PARTICLES = 72;
