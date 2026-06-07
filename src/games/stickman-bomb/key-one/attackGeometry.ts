/**
 * Shared spawn geometry for stickman attacks toward the counter.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import type { Point2 } from './animationUtils';
import { BOW_ARCHER_H, BOW_ARCHER_W } from './bowConfig';

/** Attack angle (degrees): 0 = right, 90 = down, 180 = left, 270 = up */
export type AttackAngle = number;

export const STICKMAN_W = 72;
export const STICKMAN_H = 118;
const SPAWN_DIST = 200;
const STAND_OFF = 50;

export type AttackGeometry = {
  start: Point2;
  end: Point2;
  exit: Point2;
  facingIn: 1 | -1;
  facingOut: 1 | -1;
  rollDir: 1 | -1;
  verticalRun: boolean;
  tossUp: boolean;
  counterCenter: Point2;
};

function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function rayBoxEdge(
  cx: number,
  cy: number,
  hw: number,
  hh: number,
  dirX: number,
  dirY: number,
): Point2 {
  const ax = Math.abs(dirX) || 1e-8;
  const ay = Math.abs(dirY) || 1e-8;
  const t = Math.min(hw / ax, hh / ay);
  return { x: cx + dirX * t, y: cy + dirY * t };
}

export function getAngleGeometry(
  angleDeg: number,
  boxRect: DOMRect,
  containerRect: DOMRect,
  spawnDist = SPAWN_DIST,
  figureW = STICKMAN_W,
  figureH = STICKMAN_H,
): AttackGeometry {
  const bx = boxRect.left - containerRect.left;
  const by = boxRect.top - containerRect.top;
  const bw = boxRect.width;
  const bh = boxRect.height;
  const cx = bx + bw / 2;
  const cy = by + bh / 2;

  const rad = degToRad(angleDeg);
  const outX = Math.cos(rad);
  const outY = Math.sin(rad);

  const edge = rayBoxEdge(cx, cy, bw / 2 + 8, bh / 2 + 8, outX, outY);
  const endX = edge.x - figureW / 2 - outX * STAND_OFF;
  const endY = edge.y - figureH / 2 - outY * STAND_OFF;

  const startX = endX + outX * spawnDist;
  const startY = endY + outY * spawnDist;
  const exitX = endX + outX * (spawnDist + 70);
  const exitY = endY + outY * (spawnDist + 70);

  const facingIn: 1 | -1 = cx >= endX + figureW / 2 ? 1 : -1;
  const facingOut: 1 | -1 = outX >= 0 ? 1 : -1;
  const rollDir: 1 | -1 = outX >= 0 ? 1 : -1;
  const verticalRun = Math.abs(outY) > Math.abs(outX) * 0.75;
  const tossUp = outY > 0.45 && outY >= Math.abs(outX) * 0.55;

  return {
    start: { x: startX, y: startY },
    end: { x: endX, y: endY },
    exit: { x: exitX, y: exitY },
    facingIn,
    facingOut,
    rollDir,
    verticalRun,
    tossUp,
    counterCenter: { x: cx, y: cy },
  };
}

export function randomAttackAngle(): AttackAngle {
  return Math.random() * 360;
}

export type BowAttackGeometry = {
  stand: Point2;
  facing: 1 | -1;
  /** Where the arrow tip embeds on the counter surface. */
  arrowTarget: Point2;
};

/** Archer's fixed stand position and arrow impact point on the counter. */
export function getBowAttackGeometry(
  angleDeg: number,
  boxRect: DOMRect,
  containerRect: DOMRect,
  spawnDist: number,
): BowAttackGeometry {
  const geo = getAngleGeometry(angleDeg, boxRect, containerRect, spawnDist, BOW_ARCHER_W, BOW_ARCHER_H);

  const bx = boxRect.left - containerRect.left;
  const by = boxRect.top - containerRect.top;
  const bw = boxRect.width;
  const bh = boxRect.height;
  const cx = bx + bw / 2;
  const cy = by + bh / 2;

  const rad = degToRad(angleDeg);
  const inX = -Math.cos(rad);
  const inY = -Math.sin(rad);
  const arrowTarget = rayBoxEdge(cx, cy, bw / 2 - 2, bh / 2 - 2, inX, inY);

  return {
    stand: geo.start,
    facing: geo.facingIn,
    arrowTarget,
  };
}
