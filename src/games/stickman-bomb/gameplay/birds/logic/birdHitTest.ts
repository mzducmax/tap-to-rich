/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BIRD_HIT_PADDING, BIRD_POOP_CENTER_HALF_BAND } from '../config/birdConfig';
import type { BirdSpawn } from './buildBirdFlock';
import {
  computeBirdCrossProgress,
  computeBirdScreenRect,
  type BirdScreenRect,
} from './birdPosition';

export function isBirdInPoopZone(
  birdCenterX: number,
  containerWidth: number,
): boolean {
  const screenCenter = containerWidth * 0.5;
  const halfBand = containerWidth * BIRD_POOP_CENTER_HALF_BAND;
  return (
    birdCenterX >= screenCenter - halfBand &&
    birdCenterX <= screenCenter + halfBand
  );
}

/** Duck overlaps the counter width — poop may drop in any vertical column above digits. */
export function isDuckAboveCounterWidth(
  rect: BirdScreenRect,
  counter: HTMLElement,
  container: HTMLElement,
): boolean {
  const containerRect = container.getBoundingClientRect();
  const counterRect = counter.getBoundingClientRect();
  const left = counterRect.left - containerRect.left;
  const right = counterRect.right - containerRect.left;
  const birdRight = rect.leftX + rect.width;
  return birdRight >= left && rect.leftX <= right;
}

export type { BirdScreenRect } from './birdPosition';

export function hitTestBirdAtPoint(
  flock: readonly BirdSpawn[],
  hitIds: ReadonlySet<number>,
  elapsedSinceWaveMs: number,
  layerWidth: number,
  layerHeight: number,
  x: number,
  y: number,
  padding = BIRD_HIT_PADDING,
): number | null {
  for (const bird of flock) {
    if (hitIds.has(bird.id)) continue;

    const progress = computeBirdCrossProgress(bird, elapsedSinceWaveMs);
    if (progress === null) continue;

    const rect = computeBirdScreenRect(bird, progress, layerWidth, layerHeight);

    if (
      x >= rect.leftX - padding &&
      x <= rect.leftX + rect.width + padding &&
      y >= rect.topY - padding &&
      y <= rect.topY + rect.height + padding
    ) {
      return bird.id;
    }
  }

  return null;
}

export function isPointInCounterZone(
  x: number,
  y: number,
  counter: HTMLElement,
  container: HTMLElement,
  scatterPadX = 36,
  scatterPadY = 28,
): boolean {
  const containerRect = container.getBoundingClientRect();
  const counterRect = counter.getBoundingClientRect();

  const left = counterRect.left - containerRect.left - scatterPadX;
  const right = counterRect.right - containerRect.left + scatterPadX;
  const top = counterRect.top - containerRect.top - scatterPadY;
  const bottom = counterRect.bottom - containerRect.top + scatterPadY;

  return x >= left && x <= right && y >= top && y <= bottom;
}
