/**
 * Compositor layer for the divine crossbow — portaled above the bottom HUD panel.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ActiveDivineCrossbow } from '../hooks/useDivineCrossbow';
import { divineCrossbowUrl } from '../config/divineCrossbowAssets';
import { DIVINE_CROSSBOW_OVERLAY_Z } from '../config/divineCrossbowConfig';
import { prewarmDivineCrossbowPool } from '../logic/divineCrossbowPool';
import { DivineCrossbowInstance } from './DivineCrossbowInstance';
import { divineCrossbowStyles } from '../styles/divineCrossbowStyles';

type ClipRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type DivineCrossbowLayerProps = {
  sessions: ActiveDivineCrossbow[];
  clipRootRef: React.RefObject<HTMLElement | null>;
  gameplayTargetRef: React.RefObject<HTMLElement | null>;
  onBoltHit: () => void;
  onComplete: (sessionId: number) => void;
};

function useClipRect(clipRootRef: React.RefObject<HTMLElement | null>): ClipRect | null {
  const [rect, setRect] = useState<ClipRect | null>(null);

  useLayoutEffect(() => {
    const root = clipRootRef.current;
    if (!root) {
      setRect(null);
      return;
    }

    const sync = () => {
      const bounds = root.getBoundingClientRect();
      setRect({
        left: bounds.left,
        top: bounds.top,
        width: bounds.width,
        height: bounds.height,
      });
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(root);
    window.addEventListener('resize', sync);
    window.addEventListener('scroll', sync, true);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', sync);
      window.removeEventListener('scroll', sync, true);
    };
  }, [clipRootRef, clipRootRef.current]);

  return rect;
}

export function DivineCrossbowLayer({
  sessions,
  clipRootRef,
  gameplayTargetRef,
  onBoltHit,
  onComplete,
}: DivineCrossbowLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const fxLayerRef = useRef<HTMLDivElement>(null);
  const clipRect = useClipRect(clipRootRef);

  useEffect(() => {
    prewarmDivineCrossbowPool();
    const img = new Image();
    img.decoding = 'async';
    img.src = divineCrossbowUrl;
  }, []);

  if (sessions.length === 0 || !clipRect) return null;

  const layer = (
    <>
      <style>{divineCrossbowStyles}</style>
      <div
        ref={layerRef}
        className="divine-crossbow-layer divine-crossbow-layer-overlay"
        style={{
          position: 'fixed',
          left: clipRect.left,
          top: clipRect.top,
          width: clipRect.width,
          height: clipRect.height,
          zIndex: DIVINE_CROSSBOW_OVERLAY_Z,
        }}
        aria-hidden
      >
        <div ref={fxLayerRef} className="divine-crossbow-fx-layer" aria-hidden />
        {sessions.map((session) => (
          <DivineCrossbowInstance
            key={session.id}
            sessionId={session.id}
            spawnXRatio={session.spawnXRatio}
            layerRef={layerRef}
            fxLayerRef={fxLayerRef}
            gameplayTargetRef={gameplayTargetRef}
            onBoltHit={onBoltHit}
            onComplete={() => onComplete(session.id)}
          />
        ))}
      </div>
    </>
  );

  return createPortal(layer, document.body);
}
