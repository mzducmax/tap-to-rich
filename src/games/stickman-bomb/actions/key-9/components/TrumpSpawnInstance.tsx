/**
 * One Trump spawn session — camera zoom + money zigzag line.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useLayoutEffect, useRef } from 'react';
import { sleep, waitForRefs } from '../../shared/animationUtils';
import {
  cancelTrumpSpawnSession,
  computeTrumpSpriteAnchor,
  isTrumpSpawnCanvasReady,
  isTrumpSpawnCanvasSized,
  resizeTrumpSpawnCanvas,
  spawnTrumpSession,
} from '../logic/trumpSpawnCanvas';
import {
  resetTrumpCamera,
  zoomTrumpCameraIn,
  zoomTrumpCameraOut,
} from '../logic/trumpCamera';
import { TRUMP_BOX_POP_MS } from '../config/trumpSpawnConfig';

type TrumpSpawnInstanceProps = {
  spawnId: number;
  layerRef: React.RefObject<HTMLDivElement | null>;
  cameraStageRef: React.RefObject<HTMLDivElement | null>;
  clipRootRef: React.RefObject<HTMLDivElement | null>;
  gameplayTargetRef: React.RefObject<HTMLElement | null>;
  onReward: () => void;
  onComplete: () => void;
};

function TrumpSpawnInstanceInner({
  spawnId,
  layerRef,
  cameraStageRef,
  clipRootRef,
  gameplayTargetRef,
  onReward,
  onComplete,
}: TrumpSpawnInstanceProps) {
  const onRewardRef = useRef(onReward);
  const onCompleteRef = useRef(onComplete);
  const sequenceIdRef = useRef(0);
  onRewardRef.current = onReward;
  onCompleteRef.current = onComplete;

  useLayoutEffect(() => {
    const sequenceId = ++sequenceIdRef.current;
    let cancelled = false;

    async function runSpawn() {
      const ready = await waitForRefs([layerRef, gameplayTargetRef, cameraStageRef]);
      if (!ready) {
        onCompleteRef.current();
        return;
      }
      if (cancelled || sequenceId !== sequenceIdRef.current) return;

      for (
        let i = 0;
        i < 120 && (!isTrumpSpawnCanvasReady() || !isTrumpSpawnCanvasSized());
        i += 1
      ) {
        if (cancelled || sequenceId !== sequenceIdRef.current) return;
        const layer = layerRef.current;
        if (layer && layer.clientWidth > 0 && layer.clientHeight > 0) {
          resizeTrumpSpawnCanvas(layer.clientWidth, layer.clientHeight);
        }
        await sleep(16);
      }

      const layer = layerRef.current!;
      const estate = gameplayTargetRef.current!;
      const cameraStage = cameraStageRef.current!;

      const layerRect = layer.getBoundingClientRect();
      if (layerRect.width > 0 && layerRect.height > 0) {
        resizeTrumpSpawnCanvas(layerRect.width, layerRect.height);
      }

      const estateRect = estate.getBoundingClientRect();
      const boxCenter = computeTrumpSpriteAnchor(estateRect, layerRect);

      const cameraFocusX = boxCenter.x;
      const cameraFocusY = boxCenter.y;
      const clipRoot = clipRootRef.current;

      layer.classList.add('trump-spawn-layer--active');

      let resolveLineComplete: (() => void) | null = null;
      const lineCompletePromise = new Promise<void>((resolve) => {
        resolveLineComplete = resolve;
      });

      const sessionPromise = spawnTrumpSession({
        boxCenter,
        resolveBoxCenter: () => {
          const freshLayerRect = layer.getBoundingClientRect();
          const freshEstateRect = estate.getBoundingClientRect();
          return computeTrumpSpriteAnchor(freshEstateRect, freshLayerRect);
        },
        onLineComplete: () => {
          if (cancelled || sequenceId !== sequenceIdRef.current) return;
          onRewardRef.current();
          resolveLineComplete?.();
        },
      });

      await sleep(Math.floor(TRUMP_BOX_POP_MS * 0.55));
      if (cancelled || sequenceId !== sequenceIdRef.current) return;

      await zoomTrumpCameraIn(cameraStage, cameraFocusX, cameraFocusY, clipRoot);
      if (cancelled || sequenceId !== sequenceIdRef.current) return;

      await lineCompletePromise;
      if (cancelled || sequenceId !== sequenceIdRef.current) return;

      const zoomOutPromise = zoomTrumpCameraOut(cameraStage, cameraFocusX, cameraFocusY, clipRoot);
      await sessionPromise;
      await zoomOutPromise;
      if (cancelled || sequenceId !== sequenceIdRef.current) return;

      layer.classList.remove('trump-spawn-layer--active');
      resetTrumpCamera(cameraStage, clipRoot);
      onCompleteRef.current();
    }

    void runSpawn();

    return () => {
      cancelled = true;
      cancelTrumpSpawnSession();
      const cameraStage = cameraStageRef.current;
      const clipRoot = clipRootRef.current;
      if (cameraStage) resetTrumpCamera(cameraStage, clipRoot);
      layerRef.current?.classList.remove('trump-spawn-layer--active');
    };
  }, [spawnId, cameraStageRef, clipRootRef, gameplayTargetRef, layerRef]);

  return null;
}

export const TrumpSpawnInstance = memo(TrumpSpawnInstanceInner);
