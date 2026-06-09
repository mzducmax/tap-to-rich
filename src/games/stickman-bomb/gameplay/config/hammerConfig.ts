/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import hammerSpriteUrl from '../assets/hammer.png';

/** Extra padding around the estate gameplay target — valid hammer strike zone */
export const HAMMER_HIT_ZONE_PADDING = 48;

export const HAMMER_SPRITE_URL = hammerSpriteUrl;
export const HAMMER_SPRITE_SIZE = 200;

/** Pivot (pommel) and head strike point — normalized 0–1 within the sprite */
export const HAMMER_PIVOT_NORM_X = 0.697;
export const HAMMER_PIVOT_NORM_Y = 0.826;
export const HAMMER_HEAD_NORM_X = 0.377;
export const HAMMER_HEAD_NORM_Y = 0.293;

/** Align sprite art orientation with the swing angle system */
export const HAMMER_SPRITE_ANGLE_OFFSET = 46;

export type HitRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export function getExpandedHitRect(
  target: HTMLElement,
  container: HTMLElement,
  padding: number,
): HitRect {
  const targetRect = target.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  return {
    left: targetRect.left - containerRect.left - padding,
    top: targetRect.top - containerRect.top - padding,
    right: targetRect.right - containerRect.left + padding,
    bottom: targetRect.bottom - containerRect.top + padding,
  };
}

export function isPointInHitZone(x: number, y: number, zone: HitRect) {
  return x >= zone.left && x <= zone.right && y >= zone.top && y <= zone.bottom;
}

export function isStrikeInHitZone(
  impactX: number,
  impactY: number,
  pivotX: number,
  pivotY: number,
  target: HTMLElement | null,
  container: HTMLElement,
  padding: number = HAMMER_HIT_ZONE_PADDING,
) {
  if (!target) return false;

  const zone = getExpandedHitRect(target, container, padding);
  return (
    isPointInHitZone(impactX, impactY, zone) ||
    isPointInHitZone(pivotX, pivotY, zone)
  );
}

export function isClickInHitZone(
  clickX: number,
  clickY: number,
  target: HTMLElement | null,
  container: HTMLElement,
  padding: number = HAMMER_HIT_ZONE_PADDING,
) {
  if (!target) return false;
  const zone = getExpandedHitRect(target, container, padding);
  return isPointInHitZone(clickX, clickY, zone);
}
