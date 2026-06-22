/**
 * Storm cloud canvas — parallax drifting clouds (key 7).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef } from 'react';
import {
  mountStormCloudCanvas,
  resizeStormCloudCanvas,
  startStormCloudAnimation,
  stopStormCloudAnimation,
  unmountStormCloudCanvas,
} from '../logic/verticalLightningStormClouds';

type StormCloudCanvasProps = {
  layerRef: React.RefObject<HTMLDivElement | null>;
};

export function StormCloudCanvas({ layerRef }: StormCloudCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const bindCanvas = useCallback((el: HTMLCanvasElement | null) => {
    canvasRef.current = el;
    if (el) {
      mountStormCloudCanvas(el);
      const layer = layerRef.current;
      if (layer && layer.clientWidth > 0 && layer.clientHeight > 0) {
        resizeStormCloudCanvas(layer.clientWidth, layer.clientHeight);
      }
      startStormCloudAnimation();
      return;
    }
    stopStormCloudAnimation();
    unmountStormCloudCanvas();
  }, [layerRef]);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const syncSize = () => {
      if (layer.clientWidth > 0 && layer.clientHeight > 0) {
        resizeStormCloudCanvas(layer.clientWidth, layer.clientHeight);
      }
    };

    const ro = new ResizeObserver(syncSize);
    ro.observe(layer);

    return () => {
      ro.disconnect();
      stopStormCloudAnimation();
      unmountStormCloudCanvas();
    };
  }, [layerRef]);

  return <canvas ref={bindCanvas} className="vertical-lightning-storm-cloud-canvas" aria-hidden />;
}
