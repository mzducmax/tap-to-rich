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
  onStart?: () => void;
  onReward: () => void;
  onRainChange?: (raining: boolean) => void;
  onComplete: () => void;
};

function PigBankInstanceInner({
  spawnId,
  layerRef,
  onStart,
  onReward,
  onRainChange,
  onComplete,
}: PigBankInstanceProps) {
  const onStartRef = useRef(onStart);
  const onRewardRef = useRef(onReward);
  const onRainChangeRef = useRef(onRainChange);
  const onCompleteRef = useRef(onComplete);
  const sequenceIdRef = useRef(0);
  onStartRef.current = onStart;
  onRewardRef.current = onReward;
  onRainChangeRef.current = onRainChange;
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

      // Fire the intro cue right as the pig actually spawns on screen, not
      // when the key press was merely queued — otherwise a second [P] press
      // while one session is still running plays the clip early and it's
      // gone (or gets cut off by the first session's completion) by the
      // time this queued spawn finally appears.
      onStartRef.current?.();

      await spawnPigBankSession({
        onReward: () => {
          if (cancelled || sequenceId !== sequenceIdRef.current) return;
          onRewardRef.current();
        },
        onRainChange: (raining) => {
          if (cancelled || sequenceId !== sequenceIdRef.current) return;
          onRainChangeRef.current?.(raining);
        },
      });

      if (cancelled || sequenceId !== sequenceIdRef.current) return;
      // Defensive: make sure the shake is cleared once the session ends.
      onRainChangeRef.current?.(false);
      onCompleteRef.current();
    }

    void runSpawn();

    return () => {
      cancelled = true;
      cancelPigBankSession();
      // Stop the game-screen shake even when torn down mid-rain.
      onRainChangeRef.current?.(false);
    };
  }, [spawnId, layerRef]);

  return null;
}

export const PigBankInstance = memo(PigBankInstanceInner);
