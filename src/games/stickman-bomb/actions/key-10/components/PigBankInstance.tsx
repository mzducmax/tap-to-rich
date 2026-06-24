/**
 * One pig bank session — descend, money pile, reward.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useLayoutEffect, useRef } from 'react';
import { sleep, waitForRefs } from '../../shared/animationUtils';
import {
  cancelPigBankSession,
  isPigBankCanvasReady,
  isPigBankCanvasSized,
  resizePigBankCanvas,
  spawnPigBankSession,
} from '../logic/pigBankCanvas';

type PigBankInstanceProps = {
  spawnId: number;
  layerRef: React.RefObject<HTMLDivElement | null>;
  onReward: () => void;
  onComplete: () => void;
};

function PigBankInstanceInner({
  spawnId,
  layerRef,
  onReward,
  onComplete,
}: PigBankInstanceProps) {
  const onRewardRef = useRef(onReward);
  const onCompleteRef = useRef(onComplete);
  const sequenceIdRef = useRef(0);
  onRewardRef.current = onReward;
  onCompleteRef.current = onComplete;

  useLayoutEffect(() => {
    const sequenceId = ++sequenceIdRef.current;
    let cancelled = false;

    async function runSpawn() {
      const ready = await waitForRefs([layerRef]);
      if (!ready) {
        onCompleteRef.current();
        return;
      }
      if (cancelled || sequenceId !== sequenceIdRef.current) return;

      for (
        let i = 0;
        i < 120 && (!isPigBankCanvasReady() || !isPigBankCanvasSized());
        i += 1
      ) {
        if (cancelled || sequenceId !== sequenceIdRef.current) return;
        const layer = layerRef.current;
        if (layer && layer.clientWidth > 0 && layer.clientHeight > 0) {
          resizePigBankCanvas(layer.clientWidth, layer.clientHeight);
        }
        await sleep(16);
      }

      const layer = layerRef.current!;
      const layerRect = layer.getBoundingClientRect();
      if (layerRect.width > 0 && layerRect.height > 0) {
        resizePigBankCanvas(layerRect.width, layerRect.height);
      }

      await spawnPigBankSession({
        onReward: () => {
          if (cancelled || sequenceId !== sequenceIdRef.current) return;
          onRewardRef.current();
        },
      });

      if (cancelled || sequenceId !== sequenceIdRef.current) return;
      onCompleteRef.current();
    }

    void runSpawn();

    return () => {
      cancelled = true;
      cancelPigBankSession();
    };
  }, [spawnId, layerRef]);

  return null;
}

export const PigBankInstance = memo(PigBankInstanceInner);
