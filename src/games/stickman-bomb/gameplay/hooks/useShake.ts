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
