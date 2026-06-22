/**
 * Render budget — money train + coin rain on one shared canvas.
 *
 * FX: 1 canvas layer — train sprite + pooled coins in one draw pass/frame.
 *
 * @license SPDX-License-Identifier: Apache-2.0
 */

/** Hard cap — concurrent money train passes. */
export const AVATAR_COIN_MAX_CONCURRENT = 3;

/** Peak active falling coins on the shared canvas. */
export const AVATAR_COIN_MAX_RAIN = 168;
