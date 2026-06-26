/**
 * Missile strike (key i) — rockets fly in from off-screen, hit the estate, explode.
 * @license SPDX-License-Identifier: Apache-2.0
 */

/** React-side queue: how many missile sessions may run at once. */
export const MISSILE_MAX_CONCURRENT = 8;
/** Min gap between draining queued missiles — small so rapid taps fire fast. */
export const MISSILE_SPAWN_COOLDOWN_MS = 110;
/** Hard cap on missiles drawn by the shared GPU compositor at any instant. */
export const MISSILE_MAX_ACTIVE = 24;

/** Missiles launched per key press (a fanned volley). */
export const MISSILE_VOLLEY_COUNT = 3;
/** Stagger between the missiles of one volley. */
export const MISSILE_VOLLEY_STAGGER_MS = 130;

/** Flight time from off-screen spawn to estate impact (slower = more dramatic). */
export const MISSILE_FLIGHT_MS = 1500;
/** Explosion lifetime after impact. */
export const MISSILE_EXPLODE_MS = 680;

/** Rocket body size (logical px). */
export const MISSILE_LENGTH = 64;
export const MISSILE_WIDTH = 22;
/** Peak explosion radius (logical px). */
export const MISSILE_EXPLOSION_RADIUS = 150;

/** Smoke trail tuning. */
export const MISSILE_SMOKE_LIFE_MS = 1000;
export const MISSILE_SMOKE_EMIT_MS = 42;

/** Offscreen buffer scale — caps GPU fill vs retina (visual unchanged on display). */
export const MISSILE_RENDER_DPR = 1.25;
