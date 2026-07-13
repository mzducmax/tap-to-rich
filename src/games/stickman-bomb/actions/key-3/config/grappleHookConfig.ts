/**
 * Tuning for key [3] — grappling-hook money heist.
 * @license SPDX-License-Identifier: Apache-2.0
 */

/** How many hooks may dangle at once. */
export const GRAPPLE_MAX_CONCURRENT = 4;
/** Minimum gap between launching new hooks (ms). */
export const GRAPPLE_SPAWN_COOLDOWN_MS = 220;

/** Slow descent from the top of the screen (~1 second). */
export const GRAPPLE_DESCEND_MS = 1_000;
/** Beat where the claw clamps the cash before hauling it back up. */
export const GRAPPLE_GRAB_MS = 240;
/** Slow haul back up to the top. */
export const GRAPPLE_PULL_MS = 1_000;
/** Money chunk fade-out once it clears the top. */
export const GRAPPLE_FADE_MS = 200;

/** Cash value the claw hauls out of the house (deducted from balance). */
export const GRAPPLE_CASH_AMOUNT = 100;
/** Label shown on the grabbed bundle. */
export const GRAPPLE_CASH_LABEL = `$${GRAPPLE_CASH_AMOUNT}`;

/** Peak pendulum sway during the drop (degrees). */
export const GRAPPLE_SWAY_DEG = 15;
/** Sway oscillation speed (rad/ms). */
export const GRAPPLE_SWAY_SPEED = 0.006;
/** Sway damping per ms — higher settles the swing faster, like real rope drag. */
export const GRAPPLE_SWAY_DAMP = 0.00055;
/** Fraction of the estate height the claw dips to (0 = top edge). */
export const GRAPPLE_REACH_RATIO = 0.34;
