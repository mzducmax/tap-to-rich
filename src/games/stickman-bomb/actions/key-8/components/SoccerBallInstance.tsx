/**
 * One dropped-knife session (key 8).
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
import { boundsRectFromSize, estateRectFromDom } from '../logic/soccerBallSpawn';

type SoccerBallInstanceProps = {
  kickId: number;
  layerRef: React.RefObject<HTMLDivElement | null>;
  gameplayTargetRef: React.RefObject<HTMLElement | null>;
  onEstateHit: () => void;
  onComplete: () => void;
};

function SoccerBallInstanceInner({
  kickId,
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

    async function runDrop() {
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
      const layerRect = layer.getBoundingClientRect();

      if (layerRect.width <= 0 || layerRect.height <= 0) {
        onCompleteRef.current();
        return;
      }

      resizeSoccerBallCanvas(layerRect.width, layerRect.height);

      const estate = gameplayTargetRef.current;
      let bounds;
      if (estate) {
        const estateRect = estate.getBoundingClientRect();
        bounds = estateRectFromDom(estateRect, layerRect, -15);
      } else {
        bounds = boundsRectFromSize(layerRect.width, layerRect.height);
      }

      await spawnSoccerBallKick({
        kickId,
        bounds,
        onEstateHit: () => onEstateHitRef.current(),
      });

      if (cancelled || sequenceId !== sequenceIdRef.current) return;
      onCompleteRef.current();
    }

    void runDrop();

    return () => {
      cancelled = true;
      cancelSoccerBallKick(kickId);
    };
  }, [gameplayTargetRef, kickId, layerRef]);

  return null;
}

export const SoccerBallInstance = memo(SoccerBallInstanceInner);
