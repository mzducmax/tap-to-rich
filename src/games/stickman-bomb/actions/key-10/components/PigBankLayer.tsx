/**
 * Pixi compositor (pig + reward) plus the money-rain video overlay (key P).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef } from 'react';
import type { ActivePigBankSpawn } from '../hooks/usePigBank';
import { moneyRainUrl } from '../config/pigBankAssets';
import {
  MONEY_VIDEO_FILL_MS,
  MONEY_VIDEO_START_DELAY_MS,
  PIG_DESCEND_MS,
} from '../config/pigBankConfig';
import {
  mountPigBankCanvas,
  resizePigBankCanvas,
  unmountPigBankCanvas,
} from '../logic/pigBankCanvas';
import { PigBankInstance } from './PigBankInstance';
import { pigBankStyles } from '../styles/pigBankStyles';

type PigBankLayerProps = {
  spawns: ActivePigBankSpawn[];
  onReward: () => void;
  onComplete: (spawnId: number) => void;
};

// When (from spawn start) the screen is full of money and it begins to vanish.
// The reward (+$ on the house) fires only after this fade completes.
const VIDEO_FADE_START_MS = PIG_DESCEND_MS + MONEY_VIDEO_FILL_MS;

export function PigBankLayer({ spawns, onReward, onComplete }: PigBankLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  // Drive the money-rain video in sync with the pig session timeline.
  const firstSpawnId = spawns[0]?.id ?? null;
  useEffect(() => {
    const video = videoRef.current;
    if (!video || firstSpawnId == null) return;

    video.style.opacity = '0';
    try {
      video.pause();
      video.currentTime = 0;
    } catch {
      /* ignore */
    }

    const playTimer = window.setTimeout(() => {
      try {
        video.currentTime = 0;
      } catch {
        /* ignore */
      }
      video.style.opacity = '1';
      void video.play().catch(() => {});
    }, MONEY_VIDEO_START_DELAY_MS);

    const fadeTimer = window.setTimeout(() => {
      video.style.opacity = '0';
    }, VIDEO_FADE_START_MS);

    return () => {
      window.clearTimeout(playTimer);
      window.clearTimeout(fadeTimer);
    };
  }, [firstSpawnId]);

  if (spawns.length === 0) return null;

  return (
    <>
      <style>{pigBankStyles}</style>
      <div ref={layerRef} className="pig-bank-layer" aria-hidden>
        <video
          ref={videoRef}
          className="pig-bank-money-video"
          src={moneyRainUrl}
          muted
          playsInline
          preload="auto"
          aria-hidden
        />
        <canvas ref={bindFxCanvas} className="pig-bank-fx-canvas" aria-hidden />
        {spawns.map((spawn) => (
          <PigBankInstance
            key={spawn.id}
            spawnId={spawn.id}
            layerRef={layerRef}
            onReward={onReward}
            onComplete={() => onComplete(spawn.id)}
          />
        ))}
      </div>
    </>
  );
}
