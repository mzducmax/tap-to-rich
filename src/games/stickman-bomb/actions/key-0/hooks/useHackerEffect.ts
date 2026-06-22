/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useQueuedSpawner } from '../../shared/useQueuedSpawner';
import {
  HACKER_COOLDOWN_MS,
  HACKER_MAX_CONCURRENT,
} from '../config/hackerEffectConfig';

export type ActiveHackerEffect = {
  id: number;
};

export function useHackerEffect(active: boolean) {
  const { items, enqueue, complete, reset } = useQueuedSpawner<ActiveHackerEffect>({
    active,
    maxConcurrent: HACKER_MAX_CONCURRENT,
    cooldownMs: HACKER_COOLDOWN_MS,
    createPayload: () => ({}),
  });

  return {
    activeEffects: items,
    triggerHackerEffect: enqueue,
    completeHackerEffect: complete,
    resetCycle: reset,
  };
}
