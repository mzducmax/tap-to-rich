/**
 * Vertical lightning strike (key 7) — procedural bolts via Pixi compositor.
 * @license SPDX-License-Identifier: Apache-2.0
 */

/** Each key-7 press fires exactly this many bolts, then the burst completes. */
export const VERTICAL_LIGHTNING_BOLTS_PER_PRESS = 5;
/**
 * Combo badge auto-clears this long after the last strike. Kept generous so a
 * follow-up key-7 press lands inside the window and chains onto the running
 * combo instead of starting over.
 */
export const VERTICAL_LIGHTNING_COMBO_RESET_MS = 2_000;
export const VERTICAL_LIGHTNING_SPAWN_INTERVAL_MS = 160;
/** Gap the queued spawner waits between starting consecutive bursts. */
export const VERTICAL_LIGHTNING_SPAWN_COOLDOWN_MS = 120;
/** Max bursts running concurrently (rapid presses overlap up to this many). */
export const VERTICAL_LIGHTNING_MAX_CONCURRENT = 6;
export const VERTICAL_LIGHTNING_MAX_ACTIVE_BOLTS = 12;
export const VERTICAL_LIGHTNING_BOLT_DURATION_MS = 420;
export const VERTICAL_LIGHTNING_ESTATE_PADDING_RATIO = 0.1;
export const VERTICAL_LIGHTNING_LENGTH_BOOST = 1.1;
export const VERTICAL_LIGHTNING_MAX_BOLT_LENGTH = 920;
export const VERTICAL_LIGHTNING_HIT_EFFECT_MS = 280;
export const VERTICAL_LIGHTNING_CLOUD_PULSE_MS = 340;
/** Offscreen buffer scale — caps GPU fill vs retina (visual unchanged on display). */
export const VERTICAL_LIGHTNING_RENDER_DPR = 1.25;
/** Storm cloud canvas DPR cap — matches lightning compositor budget. */
export const VERTICAL_LIGHTNING_STORM_CLOUD_DPR = 1.25;
