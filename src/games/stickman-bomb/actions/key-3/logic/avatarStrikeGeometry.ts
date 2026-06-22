/**
 * Arrow flight math + archer frame layout helpers.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import type { Point2 } from '../../shared/animationUtils';
import {
  ARCHER_FRAME_ARROW_TIP_X,
  ARCHER_FRAME_ARROW_TIP_Y,
  ARCHER_FRAME_AVATAR_CX,
  ARCHER_FRAME_AVATAR_CY,
  ARCHER_FRAME_AVATAR_CSS_SIZE,
  ARCHER_FRAME_AVATAR_DIAM,
  ARCHER_FRAME_CSS_WIDTH,
  ARCHER_FRAME_LAUNCH_X,
  ARCHER_FRAME_LAUNCH_Y,
  ARCHER_FRAME_NATIVE_H,
  ARCHER_FRAME_NATIVE_W,
} from '../config/avatarStrikeConfig';

export const ARCHER_FRAME_CSS_HEIGHT =
  (ARCHER_FRAME_CSS_WIDTH * ARCHER_FRAME_NATIVE_H) / ARCHER_FRAME_NATIVE_W;
const FRAME_SCALE = ARCHER_FRAME_CSS_WIDTH / ARCHER_FRAME_NATIVE_W;

/** arrow.png — flying projectile. */
export const ARROW_SPRITE_NATIVE_W = 554;
export const ARROW_SPRITE_WIDTH = 56;
const ARROW_SCALE = ARROW_SPRITE_WIDTH / ARROW_SPRITE_NATIVE_W;

/** Pixel-traced on arrow.png — rear shaft centroid + gold tip. */
const ARROW_NOCK_NATIVE = { x: 59, y: 261 };
const ARROW_TIP_NATIVE = { x: 523, y: 38 };

export const ARROW_NOCK_PX = {
  x: ARROW_NOCK_NATIVE.x * ARROW_SCALE,
  y: ARROW_NOCK_NATIVE.y * ARROW_SCALE,
};

export const ARROW_SPRITE_NATURAL_ANGLE = Math.atan2(
  ARROW_TIP_NATIVE.y - ARROW_NOCK_NATIVE.y,
  ARROW_TIP_NATIVE.x - ARROW_NOCK_NATIVE.x,
);

export const ARROW_SPRITE_LEN =
  Math.hypot(
    ARROW_TIP_NATIVE.x - ARROW_NOCK_NATIVE.x,
    ARROW_TIP_NATIVE.y - ARROW_NOCK_NATIVE.y,
  ) * ARROW_SCALE;

export const ARCHER_FRAME_LAUNCH_CSS = {
  x: ARCHER_FRAME_LAUNCH_X * FRAME_SCALE,
  y: ARCHER_FRAME_LAUNCH_Y * FRAME_SCALE,
};

export const ARCHER_FRAME_AVATAR_CSS = {
  cx: ARCHER_FRAME_AVATAR_CX * FRAME_SCALE,
  cy: ARCHER_FRAME_AVATAR_CY * FRAME_SCALE,
  size: ARCHER_FRAME_AVATAR_CSS_SIZE,
};

/** CSS layout — avatar position tracks bow; size stays fixed in px. */
export const ARCHER_FRAME_AVATAR_LAYOUT = {
  cxW: ARCHER_FRAME_AVATAR_CX / ARCHER_FRAME_NATIVE_W,
  cyH: ARCHER_FRAME_AVATAR_CY / ARCHER_FRAME_NATIVE_H,
  sizePx: ARCHER_FRAME_AVATAR_CSS_SIZE,
} as const;

/** CSS `calc()` ratios — launch anchor tracks bow nock exactly. */
export const ARCHER_FRAME_LAUNCH_LAYOUT = {
  leftW: ARCHER_FRAME_LAUNCH_X / ARCHER_FRAME_NATIVE_W,
  topH: ARCHER_FRAME_LAUNCH_Y / ARCHER_FRAME_NATIVE_H,
} as const;

/** Aim direction of the built-in arrow on bow.png (nock → tip). */
export const BOW_NATURAL_ANGLE = Math.atan2(
  ARCHER_FRAME_ARROW_TIP_Y - ARCHER_FRAME_LAUNCH_Y,
  ARCHER_FRAME_ARROW_TIP_X - ARCHER_FRAME_LAUNCH_X,
);

export function aimAngle(from: Point2, to: Point2): number {
  return Math.atan2(to.y - from.y, to.x - from.x);
}

/** CSS rotate for bow-aim wrapper so the sprite faces aimAngleRad. */
export function bowAimRotation(aimAngleRad: number): number {
  return aimAngleRad - BOW_NATURAL_ANGLE;
}

/** Nock in layer space — no layout read; pivot stays fixed while bow-aim rotates. */
export function nockFromPortal(portalX: number, portalY: number): Point2 {
  return {
    x: portalX + ARCHER_FRAME_LAUNCH_CSS.x - ARCHER_FRAME_CSS_WIDTH / 2,
    y: portalY + ARCHER_FRAME_LAUNCH_CSS.y - ARCHER_FRAME_CSS_HEIGHT / 2,
  };
}

export function arrowFlightRotation(angleRad: number): number {
  return angleRad - ARROW_SPRITE_NATURAL_ANGLE;
}

export function arrowSpriteTransform(nockX: number, nockY: number, angleRad: number): string {
  const rot = arrowFlightRotation(angleRad);
  const nx = ARROW_NOCK_PX.x;
  const ny = ARROW_NOCK_PX.y;
  return `translate3d(${nockX}px, ${nockY}px, 0) rotate(${rot}rad) translate3d(${-nx}px, ${-ny}px, 0)`;
}

export function nockFromTip(tip: Point2, angleRad: number): Point2 {
  return {
    x: tip.x - Math.cos(angleRad) * ARROW_SPRITE_LEN,
    y: tip.y - Math.sin(angleRad) * ARROW_SPRITE_LEN,
  };
}
