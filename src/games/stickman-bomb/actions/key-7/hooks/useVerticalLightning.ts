/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useQueuedSpawner } from '../../shared/useQueuedSpawner';
import {
  VERTICAL_LIGHTNING_MAX_CONCURRENT,
  VERTICAL_LIGHTNING_SPAWN_COOLDOWN_MS,
} from '../config/verticalLightningConfig';

export type ActiveVerticalLightning = {
  id: number;
};

export function useVerticalLightning(active: boolean) {
  const { items, enqueue, complete, reset } = useQueuedSpawner<ActiveVerticalLightning>({
    active,
    maxConcurrent: VERTICAL_LIGHTNING_MAX_CONCURRENT,
    cooldownMs: VERTICAL_LIGHTNING_SPAWN_COOLDOWN_MS,
    createPayload: () => ({}),
  });

  return {
    activeStorms: items,
    triggerVerticalLightning: enqueue,
    completeVerticalLightning: complete,
    resetCycle: reset,
  };
}
