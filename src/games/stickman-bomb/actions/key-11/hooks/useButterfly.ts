/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useQueuedSpawner } from '../../shared/useQueuedSpawner';
import {
  BUTTERFLY_SPAWN_COOLDOWN_MS,
  BUTTERFLY_SPAWN_MAX_CONCURRENT,
} from '../config/butterflyConfig';

export type ActiveButterflySpawn = {
  id: number;
};

export function useButterfly(active: boolean) {
  const { items, enqueue, complete, reset } = useQueuedSpawner<ActiveButterflySpawn>({
    active,
    maxConcurrent: BUTTERFLY_SPAWN_MAX_CONCURRENT,
    cooldownMs: BUTTERFLY_SPAWN_COOLDOWN_MS,
    createPayload: () => ({}),
  });

  return {
    activeSpawns: items,
    triggerButterfly: enqueue,
    completeButterfly: complete,
    resetCycle: reset,
  };
}
