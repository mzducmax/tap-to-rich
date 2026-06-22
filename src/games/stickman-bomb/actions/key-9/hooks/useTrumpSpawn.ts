/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useQueuedSpawner } from '../../shared/useQueuedSpawner';
import {
  TRUMP_SPAWN_COOLDOWN_MS,
  TRUMP_SPAWN_MAX_CONCURRENT,
} from '../config/trumpSpawnConfig';

export type ActiveTrumpSpawn = {
  id: number;
};

export function useTrumpSpawn(active: boolean) {
  const { items, enqueue, complete, reset } = useQueuedSpawner<ActiveTrumpSpawn>({
    active,
    maxConcurrent: TRUMP_SPAWN_MAX_CONCURRENT,
    cooldownMs: TRUMP_SPAWN_COOLDOWN_MS,
    createPayload: () => ({}),
  });

  return {
    activeSpawns: items,
    triggerTrumpSpawn: enqueue,
    completeTrumpSpawn: complete,
    resetCycle: reset,
  };
}
