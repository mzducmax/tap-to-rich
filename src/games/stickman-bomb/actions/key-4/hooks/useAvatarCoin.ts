/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useQueuedSpawner } from '../../shared/useQueuedSpawner';
import {
  AVATAR_COIN_MAX_CONCURRENT,
  AVATAR_COIN_SPAWN_COOLDOWN_MS,
} from '../config/avatarCoinConfig';

export type ActiveAvatarCoin = {
  id: number;
};

export function useAvatarCoin(active: boolean) {
  const { items, enqueue, complete, reset } = useQueuedSpawner<ActiveAvatarCoin>({
    active,
    maxConcurrent: AVATAR_COIN_MAX_CONCURRENT,
    cooldownMs: AVATAR_COIN_SPAWN_COOLDOWN_MS,
    createPayload: () => ({}),
  });

  return {
    activeCoins: items,
    triggerCoinShower: enqueue,
    completeCoinShower: complete,
    resetCycle: reset,
  };
}
