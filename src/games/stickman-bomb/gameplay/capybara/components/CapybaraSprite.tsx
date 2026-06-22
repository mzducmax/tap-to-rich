/**
 * Clipped viewport capybara sprite — per-frame translate.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useEffect, useRef, useState } from 'react';
import { bakeTransparentSprite } from '../../../actions/key-4/logic/bakeTransparentSprite';
import {
  CAPYBARA_SPRITE_URL,
  getCapybaraFrameOffset,
} from '../config/capybaraSpriteConfig';

type CapybaraSpriteProps = {
  frameIndices: readonly number[];
  frameMs?: number;
  startFrame?: number;
  paused?: boolean;
};

let bakedSheetSrc: string | null = null;
let bakeSheetPromise: Promise<string> | null = null;

function loadBakedSheet(): Promise<string> {
  if (bakedSheetSrc) return Promise.resolve(bakedSheetSrc);
  if (!bakeSheetPromise) {
    bakeSheetPromise = new Promise((resolve, reject) => {
      const raw = new Image();
      raw.decoding = 'async';
      raw.onload = () => {
        const baked = bakeTransparentSprite(raw);
        bakedSheetSrc = baked.toDataURL('image/png');
        resolve(bakedSheetSrc);
      };
      raw.onerror = () => reject(new Error('Failed to load capybara sprite sheet'));
      raw.src = CAPYBARA_SPRITE_URL;
    });
  }
  return bakeSheetPromise;
}

export const CapybaraSprite = memo(function CapybaraSprite({
  frameIndices,
  frameMs = 280,
  startFrame = 0,
  paused = false,
}: CapybaraSpriteProps) {
  const sheetRef = useRef<HTMLImageElement>(null);
  const frameRef = useRef(startFrame % Math.max(1, frameIndices.length));
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef(0);
  const [sheetSrc, setSheetSrc] = useState<string | null>(bakedSheetSrc);

  useEffect(() => {
    let cancelled = false;
    loadBakedSheet()
      .then((src) => {
        if (!cancelled) setSheetSrc(src);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    frameRef.current = startFrame % Math.max(1, frameIndices.length);
  }, [startFrame, frameIndices.length]);

  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet || !sheetSrc || frameIndices.length === 0) return;

    const applyFrame = () => {
      const seqIndex = frameRef.current % frameIndices.length;
      const { x, y } = getCapybaraFrameOffset(frameIndices[seqIndex]);
      sheet.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    applyFrame();
    if (paused || frameIndices.length <= 1) return;

    const frameDuration = Math.max(80, frameMs);

    const tick = (now: number) => {
      if (now - lastTickRef.current >= frameDuration) {
        lastTickRef.current = now;
        frameRef.current = (frameRef.current + 1) % frameIndices.length;
        applyFrame();
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    lastTickRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [frameIndices, frameMs, paused, sheetSrc]);

  return (
    <div className="capybara-sprite-viewport">
      {sheetSrc ? (
        <img
          ref={sheetRef}
          className="capybara-sprite-sheet"
          src={sheetSrc}
          alt=""
          draggable={false}
        />
      ) : null}
    </div>
  );
});
