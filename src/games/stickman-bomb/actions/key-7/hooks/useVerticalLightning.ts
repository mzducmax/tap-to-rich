/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback } from 'react';
import { useQueuedSpawner } from '../../shared/useQueuedSpawner';
import {
  VERTICAL_LIGHTNING_MAX_CONCURRENT,
  VERTICAL_LIGHTNING_SPAWN_COOLDOWN_MS,
} from '../config/verticalLightningConfig';
import { resetVerticalLightningCombo } from '../logic/verticalLightningComboStore';

export type ActiveVerticalLightning = {
  id: number;
};

/**
 * Each key-7 press enqueues one short burst (fixed bolt count, see the
 * VerticalLightningInstance). Bursts may overlap up to the concurrency cap, and
 * every estate strike bumps the shared combo badge.
 */
export function useVerticalLightning(active: boolean) {
  const { items, enqueue, complete, reset } = useQueuedSpawner<ActiveVerticalLightning>({
    active,
    maxConcurrent: VERTICAL_LIGHTNING_MAX_CONCURRENT,
    cooldownMs: VERTICAL_LIGHTNING_SPAWN_COOLDOWN_MS,
    createPayload: () => ({}),
  });

  const resetCycle = useCallback(() => {
    reset();
    resetVerticalLightningCombo();
  }, [reset]);

  return {
    activeStorms: items,
    triggerVerticalLightning: enqueue,
    completeVerticalLightning: complete,
    resetCycle,
  };
}
