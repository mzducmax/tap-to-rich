/**
 * One kicked soccer ball session (key 8).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useLayoutEffect, useRef } from 'react';
import { sleep, waitForRefs } from '../../shared/animationUtils';
import {
  cancelSoccerBallKick,
  isSoccerBallCanvasReady,
  isSoccerBallCanvasSized,
  resizeSoccerBallCanvas,
  spawnSoccerBallKick,
} from '../logic/soccerBallCanvas';
import {
  boundsRectFromSize,
  estateRectFromDom,
} from '../logic/soccerBallSpawn';

type SoccerBallInstanceProps = {
  kickId: number;
  angleDeg: number;
  layerRef: React.RefObject<HTMLDivElement | null>;
  gameplayTargetRef: React.RefObject<HTMLElement | null>;
  onEstateHit: () => void;
  onComplete: () => void;
};

function SoccerBallInstanceInner({
  kickId,
  angleDeg,
  layerRef,
  gameplayTargetRef,
  onEstateHit,
  onComplete,
}: SoccerBallInstanceProps) {
  const onEstateHitRef = useRef(onEstateHit);
  const onCompleteRef = useRef(onComplete);
  const sequenceIdRef = useRef(0);
  onEstateHitRef.current = onEstateHit;
  onCompleteRef.current = onComplete;

  useLayoutEffect(() => {
    const sequenceId = ++sequenceIdRef.current;
    let cancelled = false;

    async function runKick() {
      const ready = await waitForRefs([layerRef, gameplayTargetRef]);
      if (!ready) {
        onCompleteRef.current();
        return;
      }
      if (cancelled || sequenceId !== sequenceIdRef.current) return;

      for (
        let i = 0;
        i < 120 && (!isSoccerBallCanvasReady() || !isSoccerBallCanvasSized());
        i += 1
      ) {
        if (cancelled || sequenceId !== sequenceIdRef.current) return;
        const layer = layerRef.current;
        if (layer && layer.clientWidth > 0 && layer.clientHeight > 0) {
          resizeSoccerBallCanvas(layer.clientWidth, layer.clientHeight);
        }
        await sleep(16);
      }

      const layer = layerRef.current!;
      const estate = gameplayTargetRef.current!;
      const layerRect = layer.getBoundingClientRect();
      const estateRect = estate.getBoundingClientRect();

      if (layerRect.width <= 0 || layerRect.height <= 0) {
        onCompleteRef.current();
        return;
      }

      resizeSoccerBallCanvas(layerRect.width, layerRect.height);

      const bounds = boundsRectFromSize(layerRect.width, layerRect.height);
      const estateBox = estateRectFromDom(estateRect, layerRect, 4);

      await spawnSoccerBallKick({
        kickId,
        angleDeg,
        bounds,
        estate: estateBox,
        onEstateHit: () => onEstateHitRef.current(),
      });

      if (cancelled || sequenceId !== sequenceIdRef.current) return;
      onCompleteRef.current();
    }

    void runKick();

    return () => {
      cancelled = true;
      cancelSoccerBallKick(kickId);
    };
  }, [angleDeg, gameplayTargetRef, kickId, layerRef]);

  return null;
}

export const SoccerBallInstance = memo(SoccerBallInstanceInner);
