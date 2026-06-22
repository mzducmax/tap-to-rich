/**
 * Compositor layer for money train sessions — single shared canvas.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef } from 'react';
import type { ActiveAvatarCoin } from '../hooks/useAvatarCoin';
import {
  mountAvatarCoinCanvas,
  prewarmAvatarCoinCanvas,
  resizeAvatarCoinCanvas,
  unmountAvatarCoinCanvas,
} from '../logic/avatarCoinCanvas';
import { AvatarCoinInstance } from './AvatarCoinInstance';
import { avatarCoinStyles } from '../styles/avatarCoinStyles';

type AvatarCoinLayerProps = {
  showers: ActiveAvatarCoin[];
  gameplayTargetRef: React.RefObject<HTMLElement | null>;
  onCoinHit: () => void;
  onShowerStart: () => void;
  onComplete: (showerId: number) => void;
};

export function AvatarCoinLayer({
  showers,
  gameplayTargetRef,
  onCoinHit,
  onShowerStart,
  onComplete,
}: AvatarCoinLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null);

  const bindFxCanvas = useCallback((el: HTMLCanvasElement | null) => {
    if (el) {
      prewarmAvatarCoinCanvas();
      mountAvatarCoinCanvas(el);
      const syncSize = () => {
        const layer = layerRef.current;
        if (!layer) return;
        resizeAvatarCoinCanvas(layer.clientWidth, layer.clientHeight);
      };
      syncSize();
      if (!layerRef.current?.clientWidth) {
        requestAnimationFrame(syncSize);
      }
      return;
    }
    unmountAvatarCoinCanvas();
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const syncSize = () => {
      resizeAvatarCoinCanvas(layer.clientWidth, layer.clientHeight);
    };

    const ro = new ResizeObserver(syncSize);
    ro.observe(layer);

    return () => {
      ro.disconnect();
    };
  }, [showers.length > 0]);

  if (showers.length === 0) return null;

  return (
    <>
      <style>{avatarCoinStyles}</style>
      <div ref={layerRef} className="avatar-coin-layer" aria-hidden>
        <canvas ref={bindFxCanvas} className="avatar-coin-fx-canvas" aria-hidden />
        {showers.map((shower) => (
          <AvatarCoinInstance
            key={shower.id}
            showerId={shower.id}
            layerRef={layerRef}
            gameplayTargetRef={gameplayTargetRef}
            onCoinHit={onCoinHit}
            onShowerStart={onShowerStart}
            onComplete={() => onComplete(shower.id)}
          />
        ))}
      </div>
    </>
  );
}
