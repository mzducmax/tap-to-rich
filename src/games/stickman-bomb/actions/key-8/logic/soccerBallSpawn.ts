/**
 * Spawn geometry — one kick from off-screen toward the estate (key 8).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import {
  SOCCER_BALL_KICK_SPEED,
  SOCCER_BALL_RADIUS,
} from '../config/soccerBallConfig';
import type { BallBody, Rect } from './soccerBallPhysics';

function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

export type KickSpawn = {
  body: BallBody;
  aimAngleRad: number;
};

function rayBoxDistance(
  cx: number,
  cy: number,
  hw: number,
  hh: number,
  dirX: number,
  dirY: number,
) {
  const ax = Math.abs(dirX) || 1e-8;
  const ay = Math.abs(dirY) || 1e-8;
  return Math.min(hw / ax, hh / ay);
}

export function computeKickSpawn(
  angleDeg: number,
  bounds: Rect,
  estate: Rect,
): KickSpawn {
  const cx = (estate.left + estate.right) * 0.5;
  const cy = (estate.top + estate.bottom) * 0.5;
  const ew = (estate.right - estate.left) * 0.5;
  const eh = (estate.bottom - estate.top) * 0.5;

  const rad = degToRad(angleDeg);
  const inX = -Math.cos(rad);
  const inY = -Math.sin(rad);
  const outX = -inX;
  const outY = -inY;

  const boundsW = bounds.right - bounds.left;
  const boundsH = bounds.bottom - bounds.top;
  const boundsCx = bounds.left + boundsW * 0.5;
  const boundsCy = bounds.top + boundsH * 0.5;

  const outwardDist =
    rayBoxDistance(boundsCx, boundsCy, boundsW * 0.5, boundsH * 0.5, outX, outY) +
    rayBoxDistance(cx, cy, ew, eh, outX, outY) +
    SOCCER_BALL_RADIUS +
    48;

  const targetDist = rayBoxDistance(cx, cy, ew * 0.65, eh * 0.65, inX, inY);
  const targetX = cx + inX * targetDist;
  const targetY = cy + inY * targetDist;

  const spawnX = cx + outX * outwardDist;
  const spawnY = cy + outY * outwardDist;

  const dx = targetX - spawnX;
  const dy = targetY - spawnY;
  const dist = Math.hypot(dx, dy) || 1;
  const speed = SOCCER_BALL_KICK_SPEED;

  return {
    body: {
      x: spawnX,
      y: spawnY,
      vx: (dx / dist) * speed,
      vy: (dy / dist) * speed,
      radius: SOCCER_BALL_RADIUS,
    },
    aimAngleRad: Math.atan2(dy, dx),
  };
}

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

export function boundsRectFromSize(width: number, height: number): Rect {
  return { left: 0, top: 0, right: width, bottom: height };
}
