/**
 * Pixi compositor (1 draw call) + storm cloud parallax (key 7).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef } from 'react';
import type { ActiveVerticalLightning } from '../hooks/useVerticalLightning';
import {
  VERTICAL_LIGHTNING_CLOUD_PULSE_MS,
} from '../config/verticalLightningConfig';
import {
  mountVerticalLightningCanvas,
  resizeVerticalLightningCanvas,
  unmountVerticalLightningCanvas,
} from '../logic/verticalLightningCanvas';
import { VerticalLightningInstance } from './VerticalLightningInstance';
import { VerticalLightningComboBadge } from './VerticalLightningComboBadge';
import { verticalLightningStyles } from '../styles/verticalLightningStyles';

type VerticalLightningLayerProps = {
  storms: ActiveVerticalLightning[];
  gameplayTargetRef: React.RefObject<HTMLElement | null>;
  onLightningStrike: () => void;
  onComplete: (stormId: number) => void;
};

export function VerticalLightningLayer({
  storms,
  gameplayTargetRef,
  onLightningStrike,
  onComplete,
}: VerticalLightningLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const strikePulseTimerRef = useRef<number | null>(null);

  const handleLightningStrike = useCallback(() => {
    onLightningStrike();
    const layer = layerRef.current;
    if (!layer) return;
    layer.classList.add('vertical-lightning-strike-pulse');
    if (strikePulseTimerRef.current !== null) {
      window.clearTimeout(strikePulseTimerRef.current);
    }
    strikePulseTimerRef.current = window.setTimeout(() => {
      layer.classList.remove('vertical-lightning-strike-pulse');
      strikePulseTimerRef.current = null;
    }, VERTICAL_LIGHTNING_CLOUD_PULSE_MS);
  }, [onLightningStrike]);

  useEffect(() => () => {
    if (strikePulseTimerRef.current !== null) {
      window.clearTimeout(strikePulseTimerRef.current);
    }
  }, []);

  const bindFxCanvas = useCallback((el: HTMLCanvasElement | null) => {
    if (el) {
      const layer = layerRef.current;
      const w = layer?.clientWidth ?? el.clientWidth;
      const h = layer?.clientHeight ?? el.clientHeight;
      void mountVerticalLightningCanvas(el, w, h).then(() => {
        const current = layerRef.current;
        if (!current) return;
        resizeVerticalLightningCanvas(current.clientWidth, current.clientHeight);
      });
      return;
    }
    unmountVerticalLightningCanvas();
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const syncSize = () => {
      resizeVerticalLightningCanvas(layer.clientWidth, layer.clientHeight);
    };

    const ro = new ResizeObserver(syncSize);
    ro.observe(layer);

    return () => {
      ro.disconnect();
    };
  }, []);

  if (storms.length === 0) return null;

  return (
    <>
      <style>{verticalLightningStyles}</style>
      <div ref={layerRef} className="vertical-lightning-layer" aria-hidden>
        <div className="vertical-lightning-storm-dim" aria-hidden />
        <canvas ref={bindFxCanvas} className="vertical-lightning-fx-canvas" aria-hidden />
        <VerticalLightningComboBadge />
        {storms.map((storm) => (
          <VerticalLightningInstance
            key={storm.id}
            stormId={storm.id}
            layerRef={layerRef}
            gameplayTargetRef={gameplayTargetRef}
            onLightningStrike={handleLightningStrike}
            onComplete={() => onComplete(storm.id)}
          />
        ))}
      </div>
    </>
  );
}
