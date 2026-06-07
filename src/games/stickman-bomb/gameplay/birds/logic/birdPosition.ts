/**
 * Deterministic bird screen position — no layout reads during flock animation.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import type { BirdSpawn } from './buildBirdFlock';
import { BIRD_SPRITE_DISPLAY_H, BIRD_SPRITE_DISPLAY_W } from '../config/birdSpriteConfig';

export const BIRD_RENDER_W = BIRD_SPRITE_DISPLAY_W;
export const BIRD_RENDER_H = BIRD_SPRITE_DISPLAY_H;
/** Right edge spawn at progress 0 — birds fly right → left. */
export const BIRD_CROSS_START = 1.14;
/** Left edge exit at progress 1. */
export const BIRD_CROSS_END = -0.14;

export function computeBirdCrossProgress(
  bird: BirdSpawn,
  elapsedSinceWaveMs: number,
): number | null {
  const t = elapsedSinceWaveMs - bird.delayMs;
  if (t < 0) return null;
  return Math.min(1, t / bird.durationMs);
}

export type BirdScreenRect = {
  leftX: number;
  topY: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  bottomY: number;
};

export function computeBirdScreenRect(
  bird: BirdSpawn,
  progress: number,
  layerWidth: number,
  layerHeight: number,
): BirdScreenRect {
  const leftX =
    layerWidth * (BIRD_CROSS_START + progress * (BIRD_CROSS_END - BIRD_CROSS_START));
  const width = BIRD_RENDER_W * bird.scale;
  const height = BIRD_RENDER_H * bird.scale;
  const topY = layerHeight * (bird.topPercent / 100);
  const centerX = leftX + width / 2;
  const centerY = topY + height / 2;
  const bottomY = topY + height;

  return { leftX, topY, width, height, centerX, centerY, bottomY };
}

/** Duck flies left — tail/butt sits on the right edge of the sprite box. */
export function computeDuckButtPoint(rect: BirdScreenRect): { x: number; y: number } {
  return {
    x: rect.leftX + rect.width * (0.8 + Math.random() * 0.1),
    y: rect.topY + rect.height * (0.66 + Math.random() * 0.12),
  };
}
