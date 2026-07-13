/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useQueuedSpawner } from '../../shared/useQueuedSpawner';
import {
  TOMATO_SPAWN_COOLDOWN_MS,
  TOMATO_SPAWN_MAX_CONCURRENT,
} from '../config/tomatoConfig';

export type ActiveTomatoSpawn = {
  id: number;
};

export function useTomato(active: boolean) {
  const { items, enqueue, complete, reset } = useQueuedSpawner<ActiveTomatoSpawn>({
    active,
    maxConcurrent: TOMATO_SPAWN_MAX_CONCURRENT,
    cooldownMs: TOMATO_SPAWN_COOLDOWN_MS,
    createPayload: () => ({}),
  });

  return {
    activeSpawns: items,
    triggerTomato: enqueue,
    completeTomato: complete,
    resetCycle: reset,
  };
}
