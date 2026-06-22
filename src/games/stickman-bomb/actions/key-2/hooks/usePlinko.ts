/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useQueuedSpawner } from '../../shared/useQueuedSpawner';
import {
  PLINKO_MAX_CONCURRENT,
  PLINKO_SPAWN_COOLDOWN_MS,
} from '../config/plinkoConfig';

export type ActivePlinkoRound = {
  id: number;
};

export function usePlinko(active: boolean) {
  const { items, enqueue, complete, reset } = useQueuedSpawner<
    ActivePlinkoRound,
    Record<string, never>
  >({
    active,
    maxConcurrent: PLINKO_MAX_CONCURRENT,
    cooldownMs: PLINKO_SPAWN_COOLDOWN_MS,
    createPayload: () => ({}),
  });

  return {
    activeRounds: items,
    triggerPlinko: enqueue,
    completePlinko: complete,
    resetCycle: reset,
  };
}
