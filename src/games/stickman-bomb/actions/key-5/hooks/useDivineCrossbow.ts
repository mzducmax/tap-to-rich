/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useQueuedSpawner } from '../../shared/useQueuedSpawner';
import {
  DIVINE_CROSSBOW_MAX_CONCURRENT,
  DIVINE_CROSSBOW_SPAWN_COOLDOWN_MS,
} from '../config/divineCrossbowConfig';
import { pickBottomSpawnXRatio } from '../logic/crossbowGeometry';

export type ActiveDivineCrossbow = {
  id: number;
  spawnXRatio: number;
};

type CrossbowSpawnPayload = Omit<ActiveDivineCrossbow, 'id'>;

export function useDivineCrossbow(active: boolean) {
  const { items, enqueue, complete, reset } = useQueuedSpawner<
    ActiveDivineCrossbow,
    CrossbowSpawnPayload
  >({
    active,
    maxConcurrent: DIVINE_CROSSBOW_MAX_CONCURRENT,
    cooldownMs: DIVINE_CROSSBOW_SPAWN_COOLDOWN_MS,
    createPayload: () => ({ spawnXRatio: pickBottomSpawnXRatio() }),
  });

  return {
    activeSessions: items,
    triggerDivineCrossbow: enqueue,
    completeDivineCrossbow: complete,
    resetCycle: reset,
  };
}
