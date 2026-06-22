/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useQueuedSpawner } from '../../shared/useQueuedSpawner';
import {
  AVATAR_STRIKE_MAX_CONCURRENT,
  AVATAR_STRIKE_SPAWN_COOLDOWN_MS,
} from '../config/avatarStrikeConfig';

export type ActiveAvatarStrike = {
  id: number;
};

export function useAvatarStrike(active: boolean) {
  const { items, enqueue, complete, reset } = useQueuedSpawner<ActiveAvatarStrike>({
    active,
    maxConcurrent: AVATAR_STRIKE_MAX_CONCURRENT,
    cooldownMs: AVATAR_STRIKE_SPAWN_COOLDOWN_MS,
    createPayload: () => ({}),
  });

  return {
    activeStrikes: items,
    triggerStrike: enqueue,
    completeStrike: complete,
    resetCycle: reset,
  };
}
