/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useQueuedSpawner } from '../../shared/useQueuedSpawner';
import {
  MISSILE_MAX_CONCURRENT,
  MISSILE_SPAWN_COOLDOWN_MS,
} from '../config/missileStrikeConfig';

export type ActiveMissileStrike = {
  id: number;
};

export function useMissileStrike(active: boolean) {
  const { items, enqueue, complete, reset } = useQueuedSpawner<ActiveMissileStrike>({
    active,
    maxConcurrent: MISSILE_MAX_CONCURRENT,
    cooldownMs: MISSILE_SPAWN_COOLDOWN_MS,
    createPayload: () => ({}),
  });

  return {
    activeMissiles: items,
    triggerMissileStrike: enqueue,
    completeMissileStrike: complete,
    resetCycle: reset,
  };
}
