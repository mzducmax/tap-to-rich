/**
 * Full-screen hacker overlay — single canvas matrix + DOM alert (in game area).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef } from 'react';
import type { ActiveHackerEffect } from '../hooks/useHackerEffect';
import {
  mountHackerMatrixCanvas,
  resizeHackerMatrixCanvas,
  startHackerMatrixLoop,
  stopHackerMatrixLoop,
  unmountHackerMatrixCanvas,
} from '../logic/hackerMatrixCanvas';
import { hackerUrl } from '../config/hackerAssets';
import { HackerEffectInstance } from './HackerEffectInstance';
import { hackerEffectStyles } from '../styles/hackerEffectStyles';

type HackerEffectLayerProps = {
  effects: ActiveHackerEffect[];
  layerHostRef: React.RefObject<HTMLElement | null>;
  cameraStageRef: React.RefObject<HTMLDivElement | null>;
  clipRootRef: React.RefObject<HTMLDivElement | null>;
  estateTargetRef: React.RefObject<HTMLElement | null>;
  balancePanelRef: React.RefObject<HTMLElement | null>;
  balanceDockRef: React.RefObject<HTMLElement | null>;
  getBalance: () => number;
  onDrain: (amount: number) => void;
  onComplete: (effectId: number) => void;
};

export function HackerEffectLayer({
  effects,
  layerHostRef,
  cameraStageRef,
  clipRootRef,
  estateTargetRef,
  balancePanelRef,
  balanceDockRef,
  getBalance,
  onDrain,
  onComplete,
}: HackerEffectLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const mountRafRef = useRef<number | null>(null);

  const syncCanvasSize = useCallback(() => {
    const layer = layerRef.current;
    if (!layer) return;
    const w = layer.clientWidth;
    const h = layer.clientHeight;
    if (w > 0 && h > 0) resizeHackerMatrixCanvas(w, h);
  }, []);

  const bindFxCanvas = useCallback(
    (el: HTMLCanvasElement | null) => {
      if (mountRafRef.current !== null) {
        cancelAnimationFrame(mountRafRef.current);
        mountRafRef.current = null;
      }

      if (el) {
        mountRafRef.current = requestAnimationFrame(() => {
          mountRafRef.current = null;
          const layer = layerRef.current;
          if (!layer || !layer.contains(el)) return;
          const w = layer.clientWidth;
          const h = layer.clientHeight;
          mountHackerMatrixCanvas(el, Math.max(w, 1), Math.max(h, 1));
          syncCanvasSize();
          startHackerMatrixLoop();
        });
        return;
      }

      stopHackerMatrixLoop();
      unmountHackerMatrixCanvas();
    },
    [syncCanvasSize],
  );

  useEffect(() => {
    return () => {
      if (mountRafRef.current !== null) {
        cancelAnimationFrame(mountRafRef.current);
        mountRafRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const img = new Image();
    img.decoding = 'async';
    img.src = hackerUrl;
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    const host = layerHostRef.current;
    if (!layer || !host || effects.length === 0) return;

    syncCanvasSize();
    startHackerMatrixLoop();

    const ro = new ResizeObserver(syncCanvasSize);
    ro.observe(host);

    return () => {
      ro.disconnect();
      stopHackerMatrixLoop();
    };
  }, [effects.length, layerHostRef, syncCanvasSize]);

  if (effects.length === 0) return null;

  return (
    <>
      <style>{hackerEffectStyles}</style>
      <div ref={layerRef} className="hacker-effect-layer" aria-hidden>
        <canvas ref={bindFxCanvas} className="hacker-effect-fx-canvas" aria-hidden />
        {effects.map((effect) => (
          <HackerEffectInstance
            key={effect.id}
            effectId={effect.id}
            layerRef={layerRef}
            cameraStageRef={cameraStageRef}
            clipRootRef={clipRootRef}
            estateTargetRef={estateTargetRef}
            balancePanelRef={balancePanelRef}
            balanceDockRef={balanceDockRef}
            getBalance={getBalance}
            onDrain={onDrain}
            onComplete={() => onComplete(effect.id)}
          />
        ))}
      </div>
    </>
  );
}
