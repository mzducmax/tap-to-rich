/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useQueuedSpawner } from '../../shared/useQueuedSpawner';
import {
  DICE_MAX_CONCURRENT,
  DICE_SPAWN_COOLDOWN_MS,
  rollDiceMultiplier,
} from '../config/diceRollConfig';

export type ActiveDiceRoll = {
  id: number;
  multiplier: number;
};

export function useDiceRoll(active: boolean) {
  const { items, enqueue, complete, reset } = useQueuedSpawner<
    ActiveDiceRoll,
    { multiplier: number }
  >({
    active,
    maxConcurrent: DICE_MAX_CONCURRENT,
    cooldownMs: DICE_SPAWN_COOLDOWN_MS,
    createPayload: () => ({ multiplier: rollDiceMultiplier() }),
  });

  return {
    activeRolls: items,
    triggerDiceRoll: enqueue,
    completeDiceRoll: complete,
    resetCycle: reset,
  };
}
