/**
 * Soccer ball kick tuning (key 8).
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const SOCCER_BALL_PENALTY = 5;

/** Max balls on screen at once (single canvas, N drawImage/frame). */
export const SOCCER_BALL_MAX_CONCURRENT = 8;

/** Short cooldown so key 8 can spawn many kicks quickly. */
export const SOCCER_BALL_SPAWN_COOLDOWN_MS = 120;

export const SOCCER_BALL_RADIUS = 36;
export const SOCCER_BALL_DISPLAY_SIZE = SOCCER_BALL_RADIUS * 2;

/** px/s — initial shot toward the estate. */
export const SOCCER_BALL_KICK_SPEED = 1580;

/** px/s — speed after bouncing off the estate toward a screen edge. */
export const SOCCER_BALL_EDGE_SPEED = 1420;

/** px/s² — light arc on the incoming shot only. */
export const SOCCER_BALL_GRAVITY = 520;

/** Bounce energy retention on screen edges (0–1). */
export const SOCCER_BALL_RESTITUTION = 0.78;

/** Tangential damping on estate impact. */
export const SOCCER_BALL_FRICTION = 0.06;

/** Auto-remove each ball after this duration. */
export const SOCCER_BALL_MAX_DURATION_MS = 4200;

/** Edge bounces before the ball despawns (visual only, no score). */
export const SOCCER_BALL_MAX_EDGE_BOUNCES = 3;

/** Impact burst duration (ms) — estate hit. */
export const SOCCER_BALL_HIT_EFFECT_MS = 720;

/** Impact burst duration (ms) — edge bounce / roll. */
export const SOCCER_BALL_HIT_EFFECT_EDGE_MS = 580;

/** Pooled canvas particles for hit + roll dust bursts. */
export const SOCCER_BALL_MAX_HIT_PARTICLES = 192;

/** Roll dust while the ball skims after a bounce (ms between puffs). */
export const SOCCER_BALL_ROLL_DUST_INTERVAL_MS = 42;

/** Min speed (px/s) before roll dust appears. */
export const SOCCER_BALL_ROLL_DUST_MIN_SPEED = 160;

/** Chroma-key threshold when stripping black from the sprite at load. */
export const SOCCER_BALL_BG_KEY_THRESHOLD = 42;

export const SOCCER_BALL_RENDER_DPR = 2;
