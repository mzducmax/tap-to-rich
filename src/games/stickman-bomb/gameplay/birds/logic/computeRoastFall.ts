/**
 * Fall distance so roast plate lands on ground below the score counter.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { ROAST_DISPLAY_H, ROAST_LAND_EXTRA_PX } from '../config/birdRoastConfig';

export function computeRoastFallPx(
  birdTopY: number,
  birdScale: number,
  container: HTMLElement,
  counter: HTMLElement,
): { fallPx: number; fallMs: number } {
  const containerRect = container.getBoundingClientRect();
  const counterRect = counter.getBoundingClientRect();
  const counterBottom = counterRect.bottom - containerRect.top;
  const roastH = ROAST_DISPLAY_H * birdScale;
  const landingY = counterBottom + ROAST_LAND_EXTRA_PX;
  const fallPx = Math.max(24, landingY - birdTopY - roastH);
  const fallMs = Math.round(420 + Math.min(fallPx, 640) * 0.75);
  return { fallPx, fallMs };
}
