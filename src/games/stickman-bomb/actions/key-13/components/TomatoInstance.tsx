/**
 * One tomato session — registers with the shared canvas compositor (key 13 / [U]).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useLayoutEffect, useRef } from 'react';
import { sleep, waitForRefs } from '../../shared/animationUtils';
import {
  cancelTomato,
  isTomatoCanvasReady,
  isTomatoCanvasSized,
  resizeTomatoCanvas,
  spawnTomato,
} from '../logic/tomatoCanvas';

type TomatoInstanceProps = {
  spawnId: number;
  layerRef: React.RefObject<HTMLDivElement | null>;
  gameplayTargetRef: React.RefObject<HTMLElement | null>;
  onImpact: () => void;
  onComplete: () => void;
};

function TomatoInstanceInner({
  spawnId,
  layerRef,
  gameplayTargetRef,
  onImpact,
  onComplete,
}: TomatoInstanceProps) {
  const onImpactRef = useRef(onImpact);
  const onCompleteRef = useRef(onComplete);
  const sequenceIdRef = useRef(0);
  onImpactRef.current = onImpact;
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
        i < 120 && (!isTomatoCanvasReady() || !isTomatoCanvasSized());
        i += 1
      ) {
        if (cancelled || sequenceId !== sequenceIdRef.current) return;
        const layer = layerRef.current;
        if (layer && layer.clientWidth > 0 && layer.clientHeight > 0) {
          resizeTomatoCanvas(layer.clientWidth, layer.clientHeight);
        }
        await sleep(16);
      }

      const layer = layerRef.current!;
      const layerRect = layer.getBoundingClientRect();
      if (layerRect.width <= 0 || layerRect.height <= 0) {
        onCompleteRef.current();
        return;
      }

      resizeTomatoCanvas(layerRect.width, layerRect.height);

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

      await spawnTomato({
        id: spawnId,
        layerW: layerRect.width,
        layerH: layerRect.height,
        getHouseTarget,
        onImpact: () => onImpactRef.current(),
      });

      if (cancelled || sequenceId !== sequenceIdRef.current) return;
      onCompleteRef.current();
    }

    void run();

    return () => {
      cancelled = true;
      cancelTomato(spawnId);
    };
  }, [spawnId, layerRef, gameplayTargetRef]);

  return null;
}

export const TomatoInstance = memo(TomatoInstanceInner);
