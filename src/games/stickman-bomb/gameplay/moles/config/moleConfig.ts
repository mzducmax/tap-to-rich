/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const MOLE_REWARD = 10;
export const MOLE_COUNT = 14;
export const MOLE_HIT_PADDING = 22;

/** Pop-up sprite animation before the hittable phase. */
export const MOLE_RISE_MS = 350;
/** How long a mole stays hittable above the hole. */
export const MOLE_UP_MS = 750;
/** Pop-down animation window after the hittable phase. */
export const MOLE_DOWN_MS = 280;
/** Random idle gap before the next pop. */
export const MOLE_IDLE_MIN_MS = 600;
export const MOLE_IDLE_MAX_MS = 2_200;

/** Full whack-a-mole round after pressing E. */
export const MOLE_WAVE_DURATION_MS = 18_000;

export type MolePhase = 'idle' | 'active';
