/**
 * One gold nugget session — registers with the shared canvas compositor (key 11 / [O]).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useLayoutEffect, useRef } from 'react';
import { sleep, waitForRefs } from '../../shared/animationUtils';
import {
  cancelGoldNugget,
  isGoldNuggetCanvasReady,
  isGoldNuggetCanvasSized,
  resizeGoldNuggetCanvas,
  spawnGoldNugget,
} from '../logic/goldNuggetCanvas';

type ButterflyInstanceProps = {
  spawnId: number;
  layerRef: React.RefObject<HTMLDivElement | null>;
  gameplayTargetRef: React.RefObject<HTMLElement | null>;
  onReward: () => void;
  onComplete: () => void;
};

function ButterflyInstanceInner({
  spawnId,
  layerRef,
  gameplayTargetRef,
  onReward,
  onComplete,
}: ButterflyInstanceProps) {
  const onRewardRef = useRef(onReward);
  const onCompleteRef = useRef(onComplete);
  const sequenceIdRef = useRef(0);
  onRewardRef.current = onReward;
  onCompleteRef.current = onComplete;

  useLayoutEffect(() => {
    const sequenceId = ++sequenceIdRef.current;
    let cancelled = false;

    async function run() {
      const ready = await waitForRefs([layerRef, gameplayTargetRef]);
      if (!ready) {
        onCompleteRef.current();
        return;
      }
      if (cancelled || sequenceId !== sequenceIdRef.current) return;

      for (
        let i = 0;
        i < 120 && (!isGoldNuggetCanvasReady() || !isGoldNuggetCanvasSized());
        i += 1
      ) {
        if (cancelled || sequenceId !== sequenceIdRef.current) return;
        const layer = layerRef.current;
        if (layer && layer.clientWidth > 0 && layer.clientHeight > 0) {
          resizeGoldNuggetCanvas(layer.clientWidth, layer.clientHeight);
        }
        await sleep(16);
      }

      const layer = layerRef.current!;
      const layerRect = layer.getBoundingClientRect();
      if (layerRect.width <= 0 || layerRect.height <= 0) {
        onCompleteRef.current();
        return;
      }

      resizeGoldNuggetCanvas(layerRect.width, layerRect.height);

      const getHouseTarget = () => {
        const estate = gameplayTargetRef.current;
        const freshLayer = layerRef.current?.getBoundingClientRect();
        let houseX = layerRect.width * 0.5;
        let houseY = layerRect.height * 0.62;
        if (estate && freshLayer) {
          const r = estate.getBoundingClientRect();
          houseX = r.left - freshLayer.left + r.width / 2;
          houseY = r.top - freshLayer.top + r.height * 0.42;
        }
        return { x: houseX, y: houseY };
      };

      await spawnGoldNugget({
        id: spawnId,
        layerW: layerRect.width,
        layerH: layerRect.height,
        getHouseTarget,
        onReward: () => onRewardRef.current(),
      });

      if (cancelled || sequenceId !== sequenceIdRef.current) return;
      onCompleteRef.current();
    }

    void run();

    return () => {
      cancelled = true;
      cancelGoldNugget(spawnId);
    };
  }, [spawnId, layerRef, gameplayTargetRef]);

  return null;
}

export const ButterflyInstance = memo(ButterflyInstanceInner);
