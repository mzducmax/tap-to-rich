/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** Extra padding around the counter — valid hammer strike zone */
export const HAMMER_HIT_ZONE_PADDING = 140;

export const HAMMER_LENGTH = 130;
export const HAMMER_HEAD_W = 90;
export const HAMMER_HEAD_H = 55;

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
