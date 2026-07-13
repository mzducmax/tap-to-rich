/**
 * Key [3] queue — each entry is one grappling-hook money heist.
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useQueuedSpawner } from '../../shared/useQueuedSpawner';
import {
  GRAPPLE_MAX_CONCURRENT,
  GRAPPLE_SPAWN_COOLDOWN_MS,
} from '../config/grappleHookConfig';

export type ActiveAvatarStrike = {
  id: number;
};

export function useAvatarStrike(active: boolean) {
  const { items, enqueue, complete, reset } = useQueuedSpawner<ActiveAvatarStrike>({
    active,
    maxConcurrent: GRAPPLE_MAX_CONCURRENT,
    cooldownMs: GRAPPLE_SPAWN_COOLDOWN_MS,
    createPayload: () => ({}),
  });

  return {
    activeStrikes: items,
    triggerStrike: enqueue,
    completeStrike: complete,
    resetCycle: reset,
  };
}
