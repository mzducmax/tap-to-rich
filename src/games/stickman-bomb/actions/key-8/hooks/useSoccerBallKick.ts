/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback } from 'react';
import { useQueuedSpawner } from '../../shared/useQueuedSpawner';
import { cancelAllSoccerBallKicks } from '../logic/soccerBallCanvas';
import {
  SOCCER_BALL_MAX_CONCURRENT,
  SOCCER_BALL_SPAWN_COOLDOWN_MS,
} from '../config/soccerBallConfig';

export type ActiveSoccerBallKick = {
  id: number;
};

export function useSoccerBallKick(active: boolean) {
  const { items, enqueue, complete, reset } = useQueuedSpawner<ActiveSoccerBallKick>({
    active,
    maxConcurrent: SOCCER_BALL_MAX_CONCURRENT,
    cooldownMs: SOCCER_BALL_SPAWN_COOLDOWN_MS,
    createPayload: () => ({}),
  });

  const resetCycle = useCallback(() => {
    cancelAllSoccerBallKicks();
    reset();
  }, [reset]);

  return {
    activeKicks: items,
    triggerSoccerBallKick: enqueue,
    completeSoccerBallKick: complete,
    resetCycle,
  };
}
