/**
 * Single canvas compositor for the kicked soccer ball (key 8).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef } from 'react';
import type { ActiveSoccerBallKick } from '../hooks/useSoccerBallKick';
import {
  mountSoccerBallCanvas,
  resizeSoccerBallCanvas,
  unmountSoccerBallCanvas,
} from '../logic/soccerBallCanvas';
import { SoccerBallInstance } from './SoccerBallInstance';
import { soccerBallStyles } from '../styles/soccerBallStyles';

type SoccerBallLayerProps = {
  kicks: ActiveSoccerBallKick[];
  gameplayTargetRef: React.RefObject<HTMLElement | null>;
  onEstateHit: () => void;
  onComplete: (kickId: number) => void;
};

export function SoccerBallLayer({
  kicks,
  gameplayTargetRef,
  onEstateHit,
  onComplete,
}: SoccerBallLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null);

  const bindFxCanvas = useCallback((el: HTMLCanvasElement | null) => {
    if (el) {
      mountSoccerBallCanvas(el);
      const layer = layerRef.current;
      const w = layer?.clientWidth ?? el.clientWidth;
      const h = layer?.clientHeight ?? el.clientHeight;
      resizeSoccerBallCanvas(w, h);
      return;
    }
    unmountSoccerBallCanvas();
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const syncSize = () => {
      resizeSoccerBallCanvas(layer.clientWidth, layer.clientHeight);
    };

    const ro = new ResizeObserver(syncSize);
    ro.observe(layer);

    return () => {
      ro.disconnect();
    };
  }, []);

  if (kicks.length === 0) return null;

  return (
    <>
      <style>{soccerBallStyles}</style>
      <div ref={layerRef} className="soccer-ball-layer" aria-hidden>
        <canvas ref={bindFxCanvas} className="soccer-ball-fx-canvas" aria-hidden />
        {kicks.map((kick) => (
          <SoccerBallInstance
            key={kick.id}
            kickId={kick.id}
            angleDeg={kick.angle}
            layerRef={layerRef}
            gameplayTargetRef={gameplayTargetRef}
            onEstateHit={onEstateHit}
            onComplete={() => onComplete(kick.id)}
          />
        ))}
      </div>
    </>
  );
}
