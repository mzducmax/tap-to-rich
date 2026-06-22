/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const AVATAR_COIN_COUNT = 36;
export const AVATAR_COIN_REWARD = 5;
/** Minimum gap between spawning new money trains (ms). */
export const AVATAR_COIN_SPAWN_COOLDOWN_MS = 900;

export { AVATAR_COIN_MAX_CONCURRENT } from './avatarCoinPerformance';

export const AVATAR_COIN_RAIN_SPAWN_INTERVAL_MS = 26;
/** Coins released per rain burst while over the estate. */
export const AVATAR_COIN_RAIN_BURST_MIN = 3;
export const AVATAR_COIN_RAIN_BURST_MAX = 6;
export const AVATAR_COIN_RAIN_MIN_SPEED = 240;
export const AVATAR_COIN_RAIN_MAX_SPEED = 420;
export const AVATAR_COIN_RAIN_SPRITE_SIZE = 30;
/** Coin gravity (css px / s²). */
export const AVATAR_COIN_GRAVITY = 82;
/** Coin terminal fall speed (css px / s). */
export const AVATAR_COIN_TERMINAL_VY = 720;

/** Train width as a fraction of layer width while crossing. */
export const MONEY_TRAIN_WIDTH_RATIO = 0.58;
/** Vertical offset above estate roof (fraction of train height). */
export const MONEY_TRAIN_ABOVE_ESTATE_RATIO = 0.32;
/** Extra nudge down from roof-aligned lane (css px). */
export const MONEY_TRAIN_EXTRA_LIFT_PX = 8;
/** Lower lane drops this many px below the high lane. */
export const MONEY_TRAIN_LANE_DROP_PX = 26;
/** Slight diagonal drift while crossing (vy/vx). Negative = up. */
export const MONEY_TRAIN_DIAGONAL_RISE = -0.04;
/** Max travel tilt (rad) — visible diagonal while staying upright. */
export const MONEY_TRAIN_MAX_TILT_RAD = 0.2;
/** Max |vy/vx| for horizontal-ish paths. */
export const MONEY_TRAIN_MAX_VY_RATIO = 0.52;
/** Max |vy/vx| for diagonal corner fly-in paths. */
export const MONEY_TRAIN_MAX_VY_RATIO_DIAGONAL = 0.88;
/** Gentle vertical bob (css px). */
export const MONEY_TRAIN_BOB_AMPLITUDE = 4.5;
/** Horizontal travel speed (css px / s). */
export const MONEY_TRAIN_SPEED_PX = 380;
/** Fade-out after train leaves the screen (ms). */
export const AVATAR_COIN_FADE_MS = 280;

/** Pooled steam/smoke puffs — chimney, wheels, body plume. */
export const MONEY_TRAIN_SMOKE_POOL = 96;
/** Smoke burst interval while train is visible (ms). */
export const MONEY_TRAIN_SMOKE_EMIT_MS = 22;
/** Puffs spawned per burst (random between min and max). */
export const MONEY_TRAIN_SMOKE_BURST_MIN = 4;
export const MONEY_TRAIN_SMOKE_BURST_MAX = 9;
/** Brief gold sparkles when coins leave the wagons. */
export const MONEY_TRAIN_SPARK_POOL = 18;
/** Motion color streak marks behind the train. */
export const MONEY_TRAIN_TRAIL_POOL = 22;
/** "+reward" popups when a coin lands on the estate. */
export const MONEY_TRAIN_LAND_FLOAT_POOL = 40;
export const MONEY_TRAIN_LAND_FLOAT_MS = 860;
