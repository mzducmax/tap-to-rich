/**
 * Smooth money drain over a fixed duration — rAF chunked deltas.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { HACKER_DRAIN_MS } from '../config/hackerEffectConfig';

export async function runHackerMoneyDrain(
  totalAmount: number,
  onChunk: (amount: number) => void,
  durationMs = HACKER_DRAIN_MS,
): Promise<void> {
  if (totalAmount <= 0) return;

  await new Promise<void>((resolve) => {
    const start = performance.now();
    let drained = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const target = Math.floor(totalAmount * t);
      const chunk = target - drained;

      if (chunk > 0) {
        onChunk(chunk);
        drained += chunk;
      }

      if (t < 1) {
        requestAnimationFrame(tick);
        return;
      }

      const remainder = totalAmount - drained;
      if (remainder > 0) onChunk(remainder);
      resolve();
    };

    requestAnimationFrame(tick);
  });
}
