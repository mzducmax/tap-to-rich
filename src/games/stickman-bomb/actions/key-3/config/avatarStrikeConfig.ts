/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const AVATAR_STRIKE_ARROW_COUNT = 6;
export const AVATAR_STRIKE_ARROW_INTERVAL_MS = 130;
export const AVATAR_STRIKE_ARROW_FLIGHT_MS = 360;
/** Minimum gap between spawning new avatars (ms). */
export const AVATAR_STRIKE_SPAWN_COOLDOWN_MS = 160;

export { AVATAR_STRIKE_MAX_CONCURRENT } from './avatarStrikePerformance';
export const AVATAR_STRIKE_LAUNCH_EFFECT_MS = 560;
export const AVATAR_STRIKE_STICK_EFFECT_MS = 640;
export const AVATAR_STRIKE_FADE_MS = 420;

/** Bow sprite display width (px). */
export const ARCHER_FRAME_CSS_WIDTH = 126;
export const ARCHER_FRAME_NATIVE_W = 639;
export const ARCHER_FRAME_NATIVE_H = 791;
/** Avatar portrait behind bow grip (native px, calibrated on bow.png). */
export const ARCHER_FRAME_AVATAR_CX = 320;
export const ARCHER_FRAME_AVATAR_CY = 400;
/** Portrait circle — sits under the bow grip, clipped by the bow overlay. */
export const ARCHER_FRAME_AVATAR_DIAM = 180;
/** Avatar circle on screen (px) — fixed at pre-shrink bow scale (168px frame). */
export const ARCHER_FRAME_AVATAR_CSS_SIZE =
  (ARCHER_FRAME_AVATAR_DIAM / ARCHER_FRAME_NATIVE_W) * 168;
/** Built-in arrow nock on bow.png (native px, pixel-traced along shaft axis). */
export const ARCHER_FRAME_LAUNCH_X = 331;
export const ARCHER_FRAME_LAUNCH_Y = 252;
/** Built-in arrow tip on bow.png — defines the bow's natural aim direction. */
export const ARCHER_FRAME_ARROW_TIP_X = 630;
export const ARCHER_FRAME_ARROW_TIP_Y = 196;
/** Bow rotation tween when tracking a new target (ms). */
export const AVATAR_STRIKE_BOW_AIM_MS = 90;

/** Float collision size — bow height + margin. */
export const AVATAR_STRIKE_FLOAT_ENTITY_SIZE = 165;
export const AVATAR_STRIKE_FLOAT_MAX_Y_RATIO = 0.62;
export const AVATAR_STRIKE_FLOAT_MIN_SEGMENT_MS = 900;
export const AVATAR_STRIKE_FLOAT_MAX_SEGMENT_MS = 2_200;
export const AVATAR_STRIKE_FLOAT_BOB_AMPLITUDE = 14;
