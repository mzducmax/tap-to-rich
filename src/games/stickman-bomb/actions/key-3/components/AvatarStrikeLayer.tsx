/**
 * Single compositor layer for all concurrent avatar strikes (bows DOM + one FX canvas).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef } from 'react';
import type { ActiveAvatarStrike } from '../hooks/useAvatarStrike';
import {
  avatarStrikeFrameUrl,
  avatarStrikeArrowUrl,
} from '../config/avatarStrikeAssets';
import {
  mountAvatarStrikeCanvas,
  resizeAvatarStrikeCanvas,
  unmountAvatarStrikeCanvas,
} from '../logic/avatarStrikeCanvas';
import { prewarmAvatarStrikePool } from '../logic/avatarStrikePool';
import { AvatarStrikeInstance } from './AvatarStrikeInstance';
import { avatarStrikeStyles } from '../styles/avatarStrikeStyles';

type AvatarStrikeLayerProps = {
  strikes: ActiveAvatarStrike[];
  avatarUrl?: string;
  gameplayTargetRef: React.RefObject<HTMLElement | null>;
  onArrowHit: () => void;
  onComplete: (strikeId: number) => void;
};

export function AvatarStrikeLayer({
  strikes,
  avatarUrl,
  gameplayTargetRef,
  onArrowHit,
  onComplete,
}: AvatarStrikeLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const preloadedAvatarRef = useRef<string | null>(null);

  // Callback ref runs synchronously on DOM insert — before child useLayoutEffect fires arrows.
  const bindFxCanvas = useCallback((el: HTMLCanvasElement | null) => {
    if (el) {
      prewarmAvatarStrikePool();
      mountAvatarStrikeCanvas(el);
      const syncSize = () => {
        const layer = layerRef.current;
        if (!layer) return;
        resizeAvatarStrikeCanvas(layer.clientWidth, layer.clientHeight);
      };
      syncSize();
      if (!layerRef.current?.clientWidth) {
        requestAnimationFrame(syncSize);
      }
      return;
    }
    unmountAvatarStrikeCanvas();
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const syncSize = () => {
      resizeAvatarStrikeCanvas(layer.clientWidth, layer.clientHeight);
    };

    const ro = new ResizeObserver(syncSize);
    ro.observe(layer);

    return () => {
      ro.disconnect();
    };
  }, [strikes.length > 0]);

  useEffect(() => {
    for (const url of [avatarStrikeFrameUrl, avatarStrikeArrowUrl]) {
      const img = new Image();
      img.decoding = 'async';
      img.src = url;
    }
  }, []);

  useEffect(() => {
    const url = avatarUrl?.trim();
    if (!url || preloadedAvatarRef.current === url) return;
    preloadedAvatarRef.current = url;
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
  }, [avatarUrl]);

  if (strikes.length === 0) return null;

  return (
    <>
      <style>{avatarStrikeStyles}</style>
      <div ref={layerRef} className="avatar-strike-layer" aria-hidden>
        <canvas ref={bindFxCanvas} className="avatar-strike-fx-canvas" aria-hidden />
        {strikes.map((strike) => (
          <AvatarStrikeInstance
            key={strike.id}
            strikeId={strike.id}
            layerRef={layerRef}
            avatarUrl={avatarUrl}
            gameplayTargetRef={gameplayTargetRef}
            onArrowHit={onArrowHit}
            onComplete={() => onComplete(strike.id)}
          />
        ))}
      </div>
    </>
  );
}
