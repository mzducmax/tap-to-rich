/**
 * Missile strike layer — owns the shared Pixi compositor canvas (key i).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef } from 'react';
import type { ActiveMissileStrike } from '../hooks/useMissileStrike';
import {
  mountMissileCanvas,
  resizeMissileCanvas,
  unmountMissileCanvas,
} from '../logic/missileStrikeCanvas';
import { MissileStrikeInstance } from './MissileStrikeInstance';
import { missileStrikeStyles } from '../styles/missileStrikeStyles';

type MissileStrikeLayerProps = {
  missiles: ActiveMissileStrike[];
  gameplayTargetRef: React.RefObject<HTMLElement | null>;
  onEstateHit: () => void;
  onComplete: (missileId: number) => void;
};

export function MissileStrikeLayer({
  missiles,
  gameplayTargetRef,
  onEstateHit,
  onComplete,
}: MissileStrikeLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null);

  const bindFxCanvas = useCallback((el: HTMLCanvasElement | null) => {
    if (el) {
      const layer = layerRef.current;
      const w = layer?.clientWidth ?? el.clientWidth;
      const h = layer?.clientHeight ?? el.clientHeight;
      void mountMissileCanvas(el, w, h).then(() => {
        const current = layerRef.current;
        if (!current) return;
        resizeMissileCanvas(current.clientWidth, current.clientHeight);
      });
      return;
    }
    unmountMissileCanvas();
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const syncSize = () => {
      resizeMissileCanvas(layer.clientWidth, layer.clientHeight);
    };

    const ro = new ResizeObserver(syncSize);
    ro.observe(layer);

    return () => {
      ro.disconnect();
    };
  }, []);

  if (missiles.length === 0) return null;

  return (
    <>
      <style>{missileStrikeStyles}</style>
      <div ref={layerRef} className="missile-strike-layer" aria-hidden>
        <canvas ref={bindFxCanvas} className="missile-strike-fx-canvas" aria-hidden />
        {missiles.map((missile) => (
          <MissileStrikeInstance
            key={missile.id}
            missileId={missile.id}
            layerRef={layerRef}
            gameplayTargetRef={gameplayTargetRef}
            onEstateHit={onEstateHit}
            onComplete={() => onComplete(missile.id)}
          />
        ))}
      </div>
    </>
  );
}
