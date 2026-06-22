/**
 * Vertical lightning strike (key 7) — procedural bolts via Pixi compositor.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const VERTICAL_LIGHTNING_SESSION_MS = 5_500;
export const VERTICAL_LIGHTNING_SPAWN_INTERVAL_MS = 160;
export const VERTICAL_LIGHTNING_SPAWN_COOLDOWN_MS = 450;
export const VERTICAL_LIGHTNING_MAX_CONCURRENT = 3;
export const VERTICAL_LIGHTNING_MAX_ACTIVE_BOLTS = 10;
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
