/**
 * Shared gameplay loop anchor — sheep and birds use the same cycle start.
 * @license SPDX-License-Identifier: Apache-2.0
 */

/** Birds spawn this long after the sheep wave begins crossing (after warning). */
export const BIRD_DELAY_AFTER_SHEEP_MS = 20_000;

/** Full loop: warning → sheep → birds → idle → repeat. */
export const GAMEPLAY_CYCLE_MS = 52_000;
