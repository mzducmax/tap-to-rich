/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback } from 'react';
import { useAnimation } from 'motion/react';

export function useShake() {
  const controls = useAnimation();

  const shake = useCallback(
    async (intensity: number, duration = 0.2) => {
      await controls.start({
        x: [0, -intensity, intensity, -intensity * 1.5, intensity * 1.5, 0],
        transition: { duration },
      });
    },
    [controls],
  );

  return { controls, shake };
}

/** Bounce + wobble when the estate is hit (hammer, bomb, bow, bird). */
export function useEstateHitShake() {
  const controls = useAnimation();

  const shake = useCallback(
    async (intensity: number, duration = 0.22) => {
      await controls.start({
        y: [0, -intensity * 1.8, intensity * 0.55, -intensity * 0.75, 0],
        x: [0, intensity * 0.35, -intensity * 0.35, intensity * 0.2, 0],
        rotate: [0, -0.65, 0.45, -0.25, 0],
        transition: { duration },
      });
    },
    [controls],
  );

  return { controls, shake };
}
