/**
 * One missile run — flies in from off-screen, dives into the estate, explodes.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useLayoutEffect, useRef } from 'react';
import { sleep, waitForRefs } from '../../shared/animationUtils';
import {
  MISSILE_EXPLODE_MS,
  MISSILE_FLIGHT_MS,
  MISSILE_VOLLEY_COUNT,
  MISSILE_VOLLEY_STAGGER_MS,
} from '../config/missileStrikeConfig';
import {
  isMissileCanvasReady,
  isMissileCanvasSized,
  resizeMissileCanvas,
  spawnMissile,
  type MissileSpawn,
} from '../logic/missileStrikeCanvas';

type MissileStrikeInstanceProps = {
  missileId: number;
  layerRef: React.RefObject<HTMLDivElement | null>;
  gameplayTargetRef: React.RefObject<HTMLElement | null>;
  onEstateHit: () => void;
  onComplete: () => void;
};

function MissileStrikeInstanceInner({
  missileId,
  layerRef,
  gameplayTargetRef,
  onEstateHit,
  onComplete,
}: MissileStrikeInstanceProps) {
  const onEstateHitRef = useRef(onEstateHit);
  const onCompleteRef = useRef(onComplete);
  const sequenceIdRef = useRef(0);
  onEstateHitRef.current = onEstateHit;
  onCompleteRef.current = onComplete;

  useLayoutEffect(() => {
    const sequenceId = ++sequenceIdRef.current;
    let cancelled = false;

    async function runStrike() {
      const ready = await waitForRefs([layerRef, gameplayTargetRef]);
      if (!ready) {
        onCompleteRef.current();
        return;
      }
      if (cancelled || sequenceId !== sequenceIdRef.current) return;

      // Warm up the shared GPU compositor (mounted lazily by the layer).
      for (
        let i = 0;
        i < 120 && (!isMissileCanvasReady() || !isMissileCanvasSized());
        i += 1
      ) {
        if (cancelled || sequenceId !== sequenceIdRef.current) return;
        const warmupLayer = layerRef.current;
        if (warmupLayer && warmupLayer.clientWidth > 0 && warmupLayer.clientHeight > 0) {
          resizeMissileCanvas(warmupLayer.clientWidth, warmupLayer.clientHeight);
        }
        await sleep(16);
      }
      if (cancelled || sequenceId !== sequenceIdRef.current) return;

      const layer = layerRef.current!;
      const estate = gameplayTargetRef.current!;
      const layerRect = layer.getBoundingClientRect();
      const estateRect = estate.getBoundingClientRect();
      const margin = 160;

      const buildMissile = (index: number): MissileSpawn => {
        // Impact point: a little spread around the estate centre so repeats vary.
        const targetX =
          estateRect.left - layerRect.left + estateRect.width * (0.3 + Math.random() * 0.4);
        const targetY =
          estateRect.top - layerRect.top + estateRect.height * (0.16 + Math.random() * 0.34);

        // Spawn just outside a screen edge, biased to come from above so it dives.
        const fromRight = Math.random() < 0.5;
        const startX = fromRight ? layerRect.width + margin : -margin;
        const startY = -margin + Math.random() * (layerRect.height * 0.35);

        // Curved swoop: offset the Bézier controls perpendicular to the
        // straight line so each missile arcs (and can curl around the house).
        const dx = targetX - startX;
        const dy = targetY - startY;
        const len = Math.hypot(dx, dy) || 1;
        const perpX = -dy / len;
        const perpY = dx / len;
        // Alternate curve side per missile in the volley so they fan apart.
        const side = index % 2 === 0 ? 1 : -1;
        const curve = len * (0.4 + Math.random() * 0.35) * side;

        return {
          startX,
          startY,
          targetX,
          targetY,
          c1x: startX + dx * 0.33 + perpX * curve * 0.7,
          c1y: startY + dy * 0.33 + perpY * curve * 0.7,
          c2x: startX + dx * 0.7 + perpX * curve,
          c2y: startY + dy * 0.7 + perpY * curve,
          seed: Math.random() * Math.PI * 2,
          flightMs: MISSILE_FLIGHT_MS,
          explodeMs: MISSILE_EXPLODE_MS,
          onImpact: () => onEstateHitRef.current(),
        };
      };

      const launches: Promise<void>[] = [];
      for (let i = 0; i < MISSILE_VOLLEY_COUNT; i++) {
        if (cancelled || sequenceId !== sequenceIdRef.current) break;
        launches.push(spawnMissile(buildMissile(i)));
        if (i < MISSILE_VOLLEY_COUNT - 1) await sleep(MISSILE_VOLLEY_STAGGER_MS);
      }

      await Promise.all(launches);

      if (cancelled || sequenceId !== sequenceIdRef.current) return;
      onCompleteRef.current();
    }

    void runStrike();

    return () => {
      cancelled = true;
    };
  }, [missileId, gameplayTargetRef, layerRef]);

  return null;
}

export const MissileStrikeInstance = memo(MissileStrikeInstanceInner);
