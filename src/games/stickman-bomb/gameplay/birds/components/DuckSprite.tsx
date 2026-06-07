/**
 * Clipped viewport sprite — per-frame translate (non-uniform sheet grid).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useEffect, useRef } from 'react';
import {
  DUCK_FRAME_COUNT,
  DUCK_SPRITE_URL,
  getDuckFrameOffset,
} from '../config/birdSpriteConfig';

type DuckSpriteProps = {
  startFrame: number;
  flapMs: number;
};

export const DuckSprite = memo(function DuckSprite({
  startFrame,
  flapMs,
}: DuckSpriteProps) {
  const sheetRef = useRef<HTMLImageElement>(null);
  const frameRef = useRef(startFrame);

  useEffect(() => {
    frameRef.current = startFrame;
  }, [startFrame]);

  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;

    const tick = () => {
      if (sheet.closest('.bird-pigeon-drop')?.classList.contains('bird-pigeon-drop-hit')) {
        return;
      }
      const { x, y } = getDuckFrameOffset(frameRef.current);
      sheet.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      frameRef.current = (frameRef.current + 1) % DUCK_FRAME_COUNT;
    };

    tick();
    const frameMs = Math.max(40, Math.round(flapMs / DUCK_FRAME_COUNT));
    const id = window.setInterval(tick, frameMs);
    return () => window.clearInterval(id);
  }, [flapMs, startFrame]);

  return (
    <div className="bird-duck-viewport">
      <img
        ref={sheetRef}
        className="bird-duck-sheet"
        src={DUCK_SPRITE_URL}
        alt=""
        draggable={false}
      />
    </div>
  );
});
