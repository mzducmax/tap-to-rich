/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useQueuedSpawner } from '../../shared/useQueuedSpawner';
import {
  PIG_BANK_MAX_CONCURRENT,
  PIG_BANK_SPAWN_COOLDOWN_MS,
} from '../config/pigBankConfig';

export type ActivePigBankSpawn = {
  id: number;
};

export function usePigBank(active: boolean) {
  const { items, enqueue, complete, reset } = useQueuedSpawner<ActivePigBankSpawn>({
    active,
    maxConcurrent: PIG_BANK_MAX_CONCURRENT,
    cooldownMs: PIG_BANK_SPAWN_COOLDOWN_MS,
    createPayload: () => ({}),
  });

  return {
    activeSpawns: items,
    triggerPigBank: enqueue,
    completePigBank: complete,
    resetCycle: reset,
  };
}
