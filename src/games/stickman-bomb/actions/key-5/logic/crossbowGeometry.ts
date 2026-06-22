/**
 * Layout for bottom-edge divine crossbow and bolt targeting.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import type { Point2 } from '../../shared/animationUtils';
import {
  DIVINE_CROSSBOW_BOTTOM_CLIP_RATIO,
  DIVINE_CROSSBOW_BOTTOM_SPAWN_X_MAX,
  DIVINE_CROSSBOW_BOTTOM_SPAWN_X_MIN,
  DIVINE_CROSSBOW_DISPLAY_HEIGHT,
  DIVINE_CROSSBOW_DISPLAY_WIDTH,
  DIVINE_CROSSBOW_EDGE_HIDE_RATIO,
} from '../config/divineCrossbowConfig';

export type CrossbowLayout = {
  left: number;
  bottom: number;
  width: number;
  height: number;
  rotationDeg: number;
};

export function pickBottomSpawnXRatio(): number {
  return (
    DIVINE_CROSSBOW_BOTTOM_SPAWN_X_MIN +
    Math.random() * (DIVINE_CROSSBOW_BOTTOM_SPAWN_X_MAX - DIVINE_CROSSBOW_BOTTOM_SPAWN_X_MIN)
  );
}

export function getCrossbowLayout(layerWidth: number, spawnXRatio: number): CrossbowLayout {
  const width = DIVINE_CROSSBOW_DISPLAY_WIDTH;
  const fullHeight = DIVINE_CROSSBOW_DISPLAY_HEIGHT;
  const bottomVisibleHeight = fullHeight * (1 - DIVINE_CROSSBOW_BOTTOM_CLIP_RATIO);
  const bottomEdgeHide = fullHeight * DIVINE_CROSSBOW_EDGE_HIDE_RATIO;
  const maxOffscreen = width * DIVINE_CROSSBOW_EDGE_HIDE_RATIO;

  const idealLeft = layerWidth * spawnXRatio - width * 0.5;
  const left = Math.min(
    layerWidth - width + maxOffscreen,
    Math.max(-maxOffscreen, idealLeft),
  );

  return {
    left,
    bottom: -bottomEdgeHide,
    width,
    height: bottomVisibleHeight,
    rotationDeg: 0,
  };
}

export function pickEstateTarget(
  estateRect: DOMRect,
  containerRect: DOMRect,
): Point2 {
  return pickVolleyTarget(estateRect, containerRect, 0, 1);
}

/** Spread volley impacts across the estate in a tight cluster fan. */
export function pickVolleyTarget(
  estateRect: DOMRect,
  containerRect: DOMRect,
  index: number,
  count: number,
): Point2 {
  const bx = estateRect.left - containerRect.left;
  const by = estateRect.top - containerRect.top;
  const bw = estateRect.width;
  const bh = estateRect.height;
  const cx = bx + bw * 0.5;
  const cy = by + bh * 0.36;
  const spreadX = bw * 0.3;
  const spreadY = bh * 0.24;

  if (count <= 1) {
    return { x: cx, y: cy };
  }

  const t = index / (count - 1);
  const angle = -Math.PI * 0.78 + t * Math.PI * 1.56;
  const radius = 0.28 + ((index * 17) % 11) / 11 * 0.62;
  const jitterX = (((index * 31) % 9) - 4) * 2.5;
  const jitterY = (((index * 23) % 7) - 3) * 2;

  return {
    x: cx + Math.cos(angle) * spreadX * radius + jitterX,
    y: cy + Math.sin(angle) * spreadY * radius * 0.55 + jitterY,
  };
}

/** Fan launch points slightly apart at the crystal tip. */
export function spreadVolleyLaunch(launch: Point2, index: number, count: number): Point2 {
  if (count <= 1) return launch;

  const t = index / (count - 1) - 0.5;
  return {
    x: launch.x + t * 22,
    y: launch.y - Math.abs(t) * 6,
  };
}

/** Bolt homes in on the estate with a slight lateral sweep. */
export function resolveBoltShot(
  launch: Point2,
  estateTarget: Point2,
  volleyIndex = 0,
): {
  impact: Point2;
  curveSide: -1 | 1;
} {
  return {
    impact: estateTarget,
    curveSide: volleyIndex % 2 === 0 ? 1 : -1,
  };
}
