/**
 * Key [9] — Trump spawn + money zigzag line.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const TRUMP_SPAWN_REWARD = 10000;
export const TRUMP_REWARD_LABEL = `−$${TRUMP_SPAWN_REWARD.toLocaleString('en-US')}`;
export const TRUMP_SPAWN_COOLDOWN_MS = 2800;
export const TRUMP_SPAWN_MAX_CONCURRENT = 1;

/** Trump PNG display size (px, no frame). */
export const TRUMP_SPRITE_WIDTH = 220;
export const TRUMP_SPRITE_HEIGHT = 275;

/** Camera zoom toward Trump beside the estate. */
export const TRUMP_CAMERA_ZOOM_IN = 2.35;
/** Zoom out returns to 1 — never below 1 to avoid rectangular edge bleed. */
export const TRUMP_CAMERA_ZOOM_OUT = 1;
export const TRUMP_CAMERA_ZOOM_OUT_OVERSHOOT = 1.1;
export const TRUMP_CAMERA_ZOOM_IN_MS = 620;
export const TRUMP_CAMERA_ZOOM_OUT_MS = 880;

/** Sequence timing (ms). */
export const TRUMP_BOX_POP_MS = 420;
export const TRUMP_LINE_RISE_MS = 920;
export const TRUMP_BURST_MS = 680;
export const TRUMP_FADE_MS = 380;

/** Flying dollar coins on +$1000 burst — pooled, baked sprite. */
export const TRUMP_BURST_COIN_COUNT = 32;
export const TRUMP_BURST_COIN_POOL = 40;

/** Full-screen falling $1000 bills — single texture, pooled drawImage. */
export const TRUMP_MONEY_RAIN_POOL = 96;
export const TRUMP_MONEY_RAIN_SPAWN_INTERVAL_MS = 72;
export const TRUMP_MONEY_RAIN_BILL_WIDTH = 78;
export const TRUMP_MONEY_RAIN_MIN_SPEED = 165;
export const TRUMP_MONEY_RAIN_MAX_SPEED = 310;

/** Zigzag money line. */
export const TRUMP_LINE_SEGMENTS = 14;
export const TRUMP_LINE_AMPLITUDE = 42;
export const TRUMP_LINE_WIDTH = 7;

/** Pixi offscreen buffer cap. */
export const TRUMP_RENDER_DPR = 1.5;

/** Full-width stock floor chart (baked grid + path). */
export const TRUMP_STOCK_PATH_SEGMENTS = 56;
export const TRUMP_STOCK_GRID_LINES = 5;
export const TRUMP_STOCK_RISE_MS = 980;

/** Black-key threshold for PNG background removal. */
export const TRUMP_BG_KEY_THRESHOLD = 28;
