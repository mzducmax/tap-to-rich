/**
 * One vertical lightning session — procedural bolts onto the estate.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useLayoutEffect, useRef } from 'react';
import { sleep, waitForRefs } from '../../shared/animationUtils';
import {
  VERTICAL_LIGHTNING_BOLT_DURATION_MS,
  VERTICAL_LIGHTNING_BOLTS_PER_PRESS,
  VERTICAL_LIGHTNING_SPAWN_INTERVAL_MS,
} from '../config/verticalLightningConfig';
import { bumpVerticalLightningCombo } from '../logic/verticalLightningComboStore';
import { spawnVerticalCloudPulse } from '../logic/verticalLightningFxPool';
import {
  cancelVerticalBoltsByOwner,
  isVerticalLightningCanvasReady,
  isVerticalLightningCanvasSized,
  resizeVerticalLightningCanvas,
  spawnVerticalBolt,
} from '../logic/verticalLightningCanvas';
import {
  isPointInsideEstate,
  pickVerticalEstateStrikeBolt,
  resolveStrikePoint,
} from '../logic/verticalLightningSpawn';

type VerticalLightningInstanceProps = {
  stormId: number;
  layerRef: React.RefObject<HTMLDivElement | null>;
  gameplayTargetRef: React.RefObject<HTMLElement | null>;
  onLightningStrike: () => void;
  onComplete: () => void;
};

function VerticalLightningInstanceInner({
  stormId,
  layerRef,
  gameplayTargetRef,
  onLightningStrike,
  onComplete,
}: VerticalLightningInstanceProps) {
  const onStrikeRef = useRef(onLightningStrike);
  const onCompleteRef = useRef(onComplete);
  const sequenceIdRef = useRef(0);
  onStrikeRef.current = onLightningStrike;
  onCompleteRef.current = onComplete;

  useLayoutEffect(() => {
    const sequenceId = ++sequenceIdRef.current;
    let cancelled = false;

    async function runStorm() {
      const ready = await waitForRefs([layerRef, gameplayTargetRef]);
      if (!ready) {
        onCompleteRef.current();
        return;
      }
      if (cancelled || sequenceId !== sequenceIdRef.current) return;

      for (
        let i = 0;
        i < 120 && (!isVerticalLightningCanvasReady() || !isVerticalLightningCanvasSized());
        i += 1
      ) {
        if (cancelled || sequenceId !== sequenceIdRef.current) return;
        const layer = layerRef.current;
        if (layer && layer.clientWidth > 0 && layer.clientHeight > 0) {
          resizeVerticalLightningCanvas(layer.clientWidth, layer.clientHeight);
        }
        await sleep(16);
      }

      const layer = layerRef.current!;
      const estate = gameplayTargetRef.current!;

      // Cache rects — refreshed every 500ms to avoid getBoundingClientRect on every bolt.
      let layerRect = layer.getBoundingClientRect();
      let estateRect = estate.getBoundingClientRect();
      let lastRectRefresh = Date.now();
      const RECT_REFRESH_MS = 500;

      // One press fires a fixed burst of bolts, then the burst completes.
      for (let boltIndex = 0; boltIndex < VERTICAL_LIGHTNING_BOLTS_PER_PRESS; boltIndex += 1) {
        if (cancelled || sequenceId !== sequenceIdRef.current) return;

        const now = Date.now();
        if (now - lastRectRefresh >= RECT_REFRESH_MS) {
          layerRect = layer.getBoundingClientRect();
          estateRect = estate.getBoundingClientRect();
          lastRectRefresh = now;
        }
        // Canvas sizing is handled once during warm-up and by the layer's
        // ResizeObserver — no need to re-resize the shared GPU buffer on every
        // bolt spawn (with several concurrent storms that caused GPU stutter).
        const bolt = pickVerticalEstateStrikeBolt(
          layerRect.width,
          layerRect.height,
          estateRect,
          layerRect,
        );

        spawnVerticalCloudPulse(layer, bolt.cloudX);

        void spawnVerticalBolt({
          cloudX: bolt.cloudX,
          tipX: bolt.tip.x,
          tipY: bolt.tip.y,
          durationMs: VERTICAL_LIGHTNING_BOLT_DURATION_MS,
          ownerId: stormId,
          onStrike: () => {
            const freshLayerRect = layer.getBoundingClientRect();
            const freshEstateRect = estate.getBoundingClientRect();
            const strikePoint = resolveStrikePoint(
              freshEstateRect,
              freshLayerRect,
              bolt.strikeRatio,
            );
            if (!isPointInsideEstate(strikePoint, freshEstateRect, freshLayerRect)) return;
            bumpVerticalLightningCombo();
            onStrikeRef.current();
          },
        });

        await sleep(VERTICAL_LIGHTNING_SPAWN_INTERVAL_MS);
      }

      if (cancelled || sequenceId !== sequenceIdRef.current) return;
      onCompleteRef.current();
    }

    void runStorm();

    return () => {
      cancelled = true;
      // Only cancel this storm's bolts — sibling bursts (rapid presses) keep playing.
      cancelVerticalBoltsByOwner(stormId);
    };
  }, [stormId, gameplayTargetRef, layerRef]);

  return null;
}

export const VerticalLightningInstance = memo(VerticalLightningInstanceInner);
