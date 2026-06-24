/**
 * DOM/SVG layer hosting butterfly sessions (key 11 / [O]).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef } from 'react';
import type { ActiveButterflySpawn } from '../hooks/useButterfly';
import { ButterflyInstance } from './ButterflyInstance';
import { butterflyStyles } from '../styles/butterflyStyles';
import {
  mountGoldNuggetCanvas,
  resizeGoldNuggetCanvas,
  unmountGoldNuggetCanvas,
} from '../logic/goldNuggetCanvas';
import { prewarmGoldNuggetSprite } from '../logic/goldNuggetSprite';

type ButterflyLayerProps = {
  spawns: ActiveButterflySpawn[];
  gameplayTargetRef: React.RefObject<HTMLElement | null>;
  onReward: () => void;
  onComplete: (spawnId: number) => void;
};

export function ButterflyLayer({
  spawns,
  gameplayTargetRef,
  onReward,
  onComplete,
}: ButterflyLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null);

  const bindFxCanvas = useCallback((el: HTMLCanvasElement | null) => {
    if (el) {
      prewarmGoldNuggetSprite();
      mountGoldNuggetCanvas(el);
      const layer = layerRef.current;
      const w = layer?.clientWidth ?? el.clientWidth;
      const h = layer?.clientHeight ?? el.clientHeight;
      resizeGoldNuggetCanvas(w, h);
      return;
    }
    unmountGoldNuggetCanvas();
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const syncSize = () => {
      resizeGoldNuggetCanvas(layer.clientWidth, layer.clientHeight);
    };

    const ro = new ResizeObserver(syncSize);
    ro.observe(layer);

    return () => {
      ro.disconnect();
    };
  }, [spawns.length > 0]);

  if (spawns.length === 0) return null;

  return (
    <>
      <style>{butterflyStyles}</style>
      <div ref={layerRef} className="butterfly-layer" aria-hidden>
        <canvas ref={bindFxCanvas} className="butterfly-fx-canvas" aria-hidden />
        {spawns.map((spawn) => (
          <ButterflyInstance
            key={spawn.id}
            spawnId={spawn.id}
            layerRef={layerRef}
            gameplayTargetRef={gameplayTargetRef}
            onReward={onReward}
            onComplete={() => onComplete(spawn.id)}
          />
        ))}
      </div>
    </>
  );
}
