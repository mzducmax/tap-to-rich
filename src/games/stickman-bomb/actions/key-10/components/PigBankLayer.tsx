/**
 * Pixi compositor (pig + falling money + reward) for key P.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef } from 'react';
import type { ActivePigBankSpawn } from '../hooks/usePigBank';
import {
  mountPigBankCanvas,
  resizePigBankCanvas,
  unmountPigBankCanvas,
} from '../logic/pigBankCanvas';
import { PigBankInstance } from './PigBankInstance';
import { pigBankStyles } from '../styles/pigBankStyles';

type PigBankLayerProps = {
  spawns: ActivePigBankSpawn[];
  onStart?: () => void;
  onReward: () => void;
  onRainChange?: (raining: boolean) => void;
  onComplete: (spawnId: number) => void;
};

export function PigBankLayer({
  spawns,
  onStart,
  onReward,
  onRainChange,
  onComplete,
}: PigBankLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null);

  const bindFxCanvas = useCallback((el: HTMLCanvasElement | null) => {
    if (el) {
      const layer = layerRef.current;
      const w = layer?.clientWidth ?? el.clientWidth;
      const h = layer?.clientHeight ?? el.clientHeight;
      void mountPigBankCanvas(el, w, h).then(() => {
        const current = layerRef.current;
        if (!current) return;
        resizePigBankCanvas(current.clientWidth, current.clientHeight);
      });
      return;
    }
    unmountPigBankCanvas();
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const syncSize = () => {
      resizePigBankCanvas(layer.clientWidth, layer.clientHeight);
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
      <style>{pigBankStyles}</style>
      <div ref={layerRef} className="pig-bank-layer" aria-hidden>
        <canvas ref={bindFxCanvas} className="pig-bank-fx-canvas" aria-hidden />
        {spawns.map((spawn) => (
          <PigBankInstance
            key={spawn.id}
            spawnId={spawn.id}
            layerRef={layerRef}
            onStart={onStart}
            onReward={onReward}
            onRainChange={onRainChange}
            onComplete={() => onComplete(spawn.id)}
          />
        ))}
      </div>
    </>
  );
}
