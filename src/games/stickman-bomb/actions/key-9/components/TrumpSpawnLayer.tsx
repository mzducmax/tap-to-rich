/**
 * Pixi compositor (1 draw call) for Trump spawn FX (key 9).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef } from 'react';
import type { ActiveTrumpSpawn } from '../hooks/useTrumpSpawn';
import {
  mountTrumpSpawnCanvas,
  resizeTrumpSpawnCanvas,
  unmountTrumpSpawnCanvas,
} from '../logic/trumpSpawnCanvas';
import { TrumpSpawnInstance } from './TrumpSpawnInstance';
import { trumpSpawnStyles } from '../styles/trumpSpawnStyles';

type TrumpSpawnLayerProps = {
  spawns: ActiveTrumpSpawn[];
  cameraStageRef: React.RefObject<HTMLDivElement | null>;
  clipRootRef: React.RefObject<HTMLDivElement | null>;
  gameplayTargetRef: React.RefObject<HTMLElement | null>;
  onReward: () => void;
  onComplete: (spawnId: number) => void;
};

export function TrumpSpawnLayer({
  spawns,
  cameraStageRef,
  clipRootRef,
  gameplayTargetRef,
  onReward,
  onComplete,
}: TrumpSpawnLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null);

  const bindFxCanvas = useCallback((el: HTMLCanvasElement | null) => {
    if (el) {
      const layer = layerRef.current;
      const w = layer?.clientWidth ?? el.clientWidth;
      const h = layer?.clientHeight ?? el.clientHeight;
      void mountTrumpSpawnCanvas(el, w, h).then(() => {
        const current = layerRef.current;
        if (!current) return;
        resizeTrumpSpawnCanvas(current.clientWidth, current.clientHeight);
      });
      return;
    }
    unmountTrumpSpawnCanvas();
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const syncSize = () => {
      resizeTrumpSpawnCanvas(layer.clientWidth, layer.clientHeight);
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
      <style>{trumpSpawnStyles}</style>
      <div ref={layerRef} className="trump-spawn-layer" aria-hidden>
        <canvas ref={bindFxCanvas} className="trump-spawn-fx-canvas" aria-hidden />
        {spawns.map((spawn) => (
          <TrumpSpawnInstance
            key={spawn.id}
            spawnId={spawn.id}
            layerRef={layerRef}
            cameraStageRef={cameraStageRef}
            clipRootRef={clipRootRef}
            gameplayTargetRef={gameplayTargetRef}
            onReward={onReward}
            onComplete={() => onComplete(spawn.id)}
          />
        ))}
      </div>
    </>
  );
}
