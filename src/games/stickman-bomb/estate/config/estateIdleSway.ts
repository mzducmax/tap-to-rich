/**
 * Shared idle bob for the estate stack (island + building).
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const ESTATE_IDLE_SWAY = {
  y: [0, -11, 0, 9, 0],
  rotate: [0, 0.55, 0, -0.45, 0],
  transition: {
    duration: 5.2,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
};
