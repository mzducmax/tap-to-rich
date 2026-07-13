/**
 * Knife drop tuning (key 8) — a knife falls from the sky and plants at a
 * random spot on screen.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const SOCCER_BALL_PENALTY = 5;

/** Max knives on screen at once (single canvas, N draws/frame). */
export const SOCCER_BALL_MAX_CONCURRENT = 8;

/** Short cooldown so key 8 can spawn many drops quickly. */
export const SOCCER_BALL_SPAWN_COOLDOWN_MS = 120;

export const KNIFE_LENGTH = 155;
export const KNIFE_WIDTH = 30;

/** px/s — speed along the trajectory. */
export const KNIFE_FALL_SPEED = 2200;

/** Distance divisor to determine spin count (larger values = fewer spins). */
export const KNIFE_SPIN_DIST_FACTOR = 550;

/** How long the knife stays planted before despawning. */
export const KNIFE_STUCK_DURATION_MS = 900;

/** Impact burst duration (ms). */
export const KNIFE_IMPACT_FX_MS = 380;

export const SOCCER_BALL_RENDER_DPR = 2;
