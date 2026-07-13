/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useQueuedSpawner } from '../../shared/useQueuedSpawner';
import {
  MONEY_SPINNER_EXTRA_TURNS,
  MONEY_SPINNER_MAX_CONCURRENT,
  MONEY_SPINNER_MIN_TURNS,
  MONEY_SPINNER_SPAWN_COOLDOWN_MS,
  pickSpinnerSegmentIndex,
} from '../config/moneySpinnerConfig';

export type ActiveMoneySpinner = {
  id: number;
  /** Winning wedge (decided up-front; the animation just lands on it). */
  segmentIndex: number;
  /** Full clockwise turns before settling. */
  turns: number;
  /** Landing offset inside the wedge, -0.5..0.5 of a half-wedge. */
  landJitter: number;
};

type SpinnerSpawnPayload = Omit<ActiveMoneySpinner, 'id'>;

export function useMoneySpinner(active: boolean) {
  const { items, enqueue, complete, reset } = useQueuedSpawner<
    ActiveMoneySpinner,
    SpinnerSpawnPayload
  >({
    active,
    maxConcurrent: MONEY_SPINNER_MAX_CONCURRENT,
    cooldownMs: MONEY_SPINNER_SPAWN_COOLDOWN_MS,
    createPayload: () => ({
      segmentIndex: pickSpinnerSegmentIndex(),
      turns:
        MONEY_SPINNER_MIN_TURNS +
        Math.floor(Math.random() * (MONEY_SPINNER_EXTRA_TURNS + 1)),
      landJitter: (Math.random() - 0.5) * 0.7,
    }),
  });

  return {
    activeSpins: items,
    triggerMoneySpinner: enqueue,
    completeMoneySpinner: complete,
    resetCycle: reset,
  };
}
