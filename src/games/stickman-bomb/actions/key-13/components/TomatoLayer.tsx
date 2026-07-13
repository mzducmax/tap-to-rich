/**
 * DOM layer hosting tomato sessions (key 13 / [U]).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef } from 'react';
import type { ActiveTomatoSpawn } from '../hooks/useTomato';
import { TomatoInstance } from './TomatoInstance';
import { tomatoStyles } from '../styles/tomatoStyles';
import {
  mountTomatoCanvas,
  resizeTomatoCanvas,
  unmountTomatoCanvas,
} from '../logic/tomatoCanvas';
import { prewarmTomatoSprite } from '../logic/tomatoSprite';

type TomatoLayerProps = {
  spawns: ActiveTomatoSpawn[];
  gameplayTargetRef: React.RefObject<HTMLElement | null>;
  onImpact: () => void;
  onComplete: (spawnId: number) => void;
};

export function TomatoLayer({
  spawns,
  gameplayTargetRef,
  onImpact,
  onComplete,
}: TomatoLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null);

  const bindFxCanvas = useCallback((el: HTMLCanvasElement | null) => {
    if (el) {
      prewarmTomatoSprite();
      mountTomatoCanvas(el);
      const layer = layerRef.current;
      const w = layer?.clientWidth ?? el.clientWidth;
      const h = layer?.clientHeight ?? el.clientHeight;
      resizeTomatoCanvas(w, h);
      return;
    }
    unmountTomatoCanvas();
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const syncSize = () => {
      resizeTomatoCanvas(layer.clientWidth, layer.clientHeight);
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
      <style>{tomatoStyles}</style>
      <div ref={layerRef} className="tomato-layer" aria-hidden>
        <canvas ref={bindFxCanvas} className="tomato-fx-canvas" aria-hidden />
        {spawns.map((spawn) => (
          <TomatoInstance
            key={spawn.id}
            spawnId={spawn.id}
            layerRef={layerRef}
            gameplayTargetRef={gameplayTargetRef}
            onImpact={onImpact}
            onComplete={() => onComplete(spawn.id)}
          />
        ))}
      </div>
    </>
  );
}
