/**
 * Spawn geometry — a knife dropping from above the screen and planting at a
 * random position within the play area (key 8).
 * @license SPDX-License-Identifier: Apache-2.0
 */

export type Rect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export type KnifeSpawn = {
  startX: number;
  startY: number;
  landX: number;
  landY: number;
};

export function computeKnifeSpawn(bounds: Rect, containerWidth: number): KnifeSpawn {
  const landMarginX = 15;
  const landMarginY = 15;
  const width = bounds.right - bounds.left;
  const height = bounds.bottom - bounds.top;

  const landX = bounds.left + landMarginX + Math.random() * Math.max(0, width - landMarginX * 2);
  const landY = bounds.top + landMarginY + Math.random() * Math.max(0, height - landMarginY * 2);

  const startY = -120;
  const maxOffset = 250;
  const spawnOffset = (Math.random() - 0.5) * 2 * maxOffset;
  const startX = Math.max(0, Math.min(containerWidth > 0 ? containerWidth : 1200, landX + spawnOffset));

  return {
    startX,
    startY,
    landX,
    landY,
  };
}

export function boundsRectFromSize(width: number, height: number): Rect {
  return { left: 0, top: 0, right: width, bottom: height };
}

/** Generic DOM-rect helper reused by other actions (e.g. key-6 dice roll). */
export function estateRectFromDom(
  estateRect: DOMRect,
  containerRect: DOMRect,
  padding = 0,
): Rect {
  return {
    left: estateRect.left - containerRect.left - padding,
    top: estateRect.top - containerRect.top - padding,
    right: estateRect.right - containerRect.left + padding,
    bottom: estateRect.bottom - containerRect.top + padding,
  };
}
