/**
 * Decorative sky cloud parallax canvas (day / meadow themes).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef } from 'react';
import {
  mountSkyCloudCanvas,
  resizeSkyCloudCanvas,
  setSkyCloudTheme,
  startSkyCloudAnimation,
  stopSkyCloudAnimation,
  unmountSkyCloudCanvas,
} from '../logic/skyCloudCanvas';
import { skyCloudStyles } from '../styles/skyCloudStyles';
import type { ActiveThemeKey } from '../types';

type SkyCloudCanvasProps = {
  activeThemeKey: ActiveThemeKey;
  visible: boolean;
};

export function SkyCloudCanvas({ activeThemeKey, visible }: SkyCloudCanvasProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const bindCanvas = useCallback((el: HTMLCanvasElement | null) => {
    canvasRef.current = el;
    if (el) {
      mountSkyCloudCanvas(el);
      const layer = layerRef.current;
      if (layer && layer.clientWidth > 0 && layer.clientHeight > 0) {
        resizeSkyCloudCanvas(layer.clientWidth, layer.clientHeight);
      }
      startSkyCloudAnimation();
      return;
    }
    stopSkyCloudAnimation();
    unmountSkyCloudCanvas();
  }, []);

  useEffect(() => {
    setSkyCloudTheme(activeThemeKey);
  }, [activeThemeKey]);

  useEffect(() => {
    if (visible) {
      startSkyCloudAnimation();
    } else {
      stopSkyCloudAnimation();
    }
  }, [visible]);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const syncSize = () => {
      if (layer.clientWidth > 0 && layer.clientHeight > 0) {
        resizeSkyCloudCanvas(layer.clientWidth, layer.clientHeight);
      }
    };

    const ro = new ResizeObserver(syncSize);
    ro.observe(layer);

    return () => {
      ro.disconnect();
      stopSkyCloudAnimation();
      unmountSkyCloudCanvas();
    };
  }, []);

  if (!visible) return null;

  return (
    <>
      <style>{skyCloudStyles}</style>
      <div ref={layerRef} className="sky-cloud-layer" aria-hidden>
        <canvas
          ref={bindCanvas}
          className="sky-cloud-canvas"
          data-theme={activeThemeKey}
        />
      </div>
    </>
  );
}
