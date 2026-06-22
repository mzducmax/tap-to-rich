/**
 * Mouse pop-up sprite — CSS background strip (stable frame alignment at any scale).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useEffect, useRef, useState } from 'react';
import { bakeTransparentSprite } from '../../../actions/key-4/logic/bakeTransparentSprite';
import {
  MOLE_DOWN_FRAMES,
  MOLE_RISE_FRAMES,
  MOLE_SPRITE_BACKGROUND_SIZE,
  MOLE_SPRITE_URL,
  getMoleFrameBackgroundPosition,
} from '../config/moleSpriteConfig';
import { MOLE_DOWN_MS, MOLE_RISE_MS } from '../config/moleConfig';
import type { MoleVisibility } from '../types/moleTypes';

type MoleSpriteProps = {
  visibility: MoleVisibility;
  /** Loop pop-up cycle for control hints. */
  loopPop?: boolean;
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
      raw.onerror = () => reject(new Error('Failed to load mole sprite sheet'));
      raw.src = MOLE_SPRITE_URL;
    });
  }
  return bakeSheetPromise;
}

function getFramePlan(
  visibility: MoleVisibility,
  loopPop: boolean,
): {
  frames: readonly number[];
  frameMs: number;
  loop: boolean;
} {
  if (loopPop) {
    return {
      frames: [...MOLE_RISE_FRAMES, ...MOLE_DOWN_FRAMES.slice(1)],
      frameMs: Math.max(
        35,
        Math.round(
          (MOLE_RISE_MS + MOLE_DOWN_MS) /
            (MOLE_RISE_FRAMES.length + MOLE_DOWN_FRAMES.length - 1),
        ),
      ),
      loop: true,
    };
  }

  switch (visibility) {
    case 'rising':
      return {
        frames: MOLE_RISE_FRAMES,
        frameMs: Math.max(40, Math.round(MOLE_RISE_MS / MOLE_RISE_FRAMES.length)),
        loop: false,
      };
    case 'down':
      return {
        frames: MOLE_DOWN_FRAMES,
        frameMs: Math.max(35, Math.round(MOLE_DOWN_MS / MOLE_DOWN_FRAMES.length)),
        loop: false,
      };
    case 'up':
      return { frames: [6], frameMs: 0, loop: false };
    case 'hit':
      return { frames: [6], frameMs: 0, loop: false };
    case 'hidden':
    default:
      return { frames: [0], frameMs: 0, loop: false };
  }
}

export const MoleSprite = memo(function MoleSprite({
  visibility,
  loopPop = false,
}: MoleSpriteProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef(0);
  const [sheetSrc, setSheetSrc] = useState<string | null>(bakedSheetSrc);

  const plan = getFramePlan(visibility, loopPop);

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
    frameRef.current = 0;
  }, [visibility, loopPop]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !sheetSrc || plan.frames.length === 0) return;

    const applyFrame = () => {
      const seqIndex = frameRef.current % plan.frames.length;
      viewport.style.backgroundPosition = getMoleFrameBackgroundPosition(
        plan.frames[seqIndex] ?? 0,
      );
    };

    applyFrame();
    if (plan.frames.length <= 1 || plan.frameMs <= 0) return;

    const tick = (now: number) => {
      if (now - lastTickRef.current >= plan.frameMs) {
        lastTickRef.current = now;
        const next = frameRef.current + 1;
        if (next >= plan.frames.length) {
          frameRef.current = plan.loop ? 0 : plan.frames.length - 1;
        } else {
          frameRef.current = next;
        }
        applyFrame();
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    lastTickRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [loopPop, plan.frameMs, plan.frames, plan.loop, sheetSrc, visibility]);

  return (
    <div
      ref={viewportRef}
      className="mole-sprite-viewport"
      style={
        sheetSrc
          ? {
              backgroundImage: `url(${sheetSrc})`,
              backgroundSize: MOLE_SPRITE_BACKGROUND_SIZE,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: getMoleFrameBackgroundPosition(plan.frames[0] ?? 0),
            }
          : undefined
      }
    />
  );
});
