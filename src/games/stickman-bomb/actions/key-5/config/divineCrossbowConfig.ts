/**
 * Divine crossbow — bottom edge spawn, fires bolts at the estate.
 * @license SPDX-License-Identifier: Apache-2.0
 */

/** Above estate counter layer (25) and TargetGoalDock (App z-10). */
export const DIVINE_CROSSBOW_OVERLAY_Z = 40;

/** Bolts in one volley salvo per trigger. */
export const DIVINE_CROSSBOW_BOLT_COUNT = 7;
/** Stagger inside the same volley so bolts fan out together (ms). */
export const DIVINE_CROSSBOW_VOLLEY_STAGGER_MS = 28;
/** Per-bolt flight duration jitter in a volley (ms). */
export const DIVINE_CROSSBOW_VOLLEY_FLIGHT_JITTER_MS = 40;
export const DIVINE_CROSSBOW_BOLT_FLIGHT_MS = 360;
/** Lateral Bezier offset as a fraction of shot distance (homing sweep). */
export const DIVINE_CROSSBOW_BOLT_CURVE_RATIO = 0.34;
/** Control point sits this far along the aim line from launch (0–1). */
export const DIVINE_CROSSBOW_BOLT_CURVE_BIAS = 0.3;

export const DIVINE_CROSSBOW_SCALE = 2;
export const DIVINE_CROSSBOW_DISPLAY_WIDTH = 300 * DIVINE_CROSSBOW_SCALE;
export const DIVINE_CROSSBOW_NATIVE_W = 1024;
export const DIVINE_CROSSBOW_NATIVE_H = 682;
export const DIVINE_CROSSBOW_DISPLAY_HEIGHT =
  (DIVINE_CROSSBOW_DISPLAY_WIDTH * DIVINE_CROSSBOW_NATIVE_H) / DIVINE_CROSSBOW_NATIVE_W;

/** Random horizontal spawn band along the bottom edge (0–1). */
export const DIVINE_CROSSBOW_BOTTOM_SPAWN_X_MIN = 0.1;
export const DIVINE_CROSSBOW_BOTTOM_SPAWN_X_MAX = 0.9;

/** Crop handle inside rig viewport (bottom of art when facing up). */
export const DIVINE_CROSSBOW_BOTTOM_CLIP_RATIO = 0.28;

/** Fraction of weapon pushed behind screen edge (bottom spawn). */
export const DIVINE_CROSSBOW_EDGE_HIDE_RATIO = 0.3;

/** Crystal tip anchor on the crossbow art (fraction of visible height). */
export const DIVINE_CROSSBOW_TIP_X_RATIO = 0.5;
export const DIVINE_CROSSBOW_TIP_Y_RATIO = 0.05;

export const DIVINE_CROSSBOW_SPAWN_COOLDOWN_MS = 500;
export const DIVINE_CROSSBOW_MAX_CONCURRENT = 1;
export const DIVINE_CROSSBOW_FADE_MS = 300;
export const DIVINE_CROSSBOW_RECOIL_MS = 180;

export const DIVINE_CROSSBOW_LAUNCH_EFFECT_MS = 520;
export const DIVINE_CROSSBOW_HIT_EFFECT_MS = 880;

export const DIVINE_CROSSBOW_BOLT_LEN = 52 * DIVINE_CROSSBOW_SCALE;
