/**
 * Off-screen spawn with guaranteed path through estate — horizontal only.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { MONEY_TRAIN_SPEED_PX } from '../config/avatarCoinConfig';

export type TrainSpawnZone = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export type TrainSpawnPlan = {
  cx: number;
  cy: number;
  vx: number;
  vy: number;
};

function randBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

/** Center is fully outside the viewport. */
export function isTrainOutsideFrame(
  cx: number,
  cy: number,
  trainW: number,
  trainH: number,
  screenW: number,
  screenH: number,
) {
  const halfW = trainW * 0.5;
  const halfH = trainH * 0.5;
  return (
    cx + halfW < 0 ||
    cx - halfW > screenW ||
    cy + halfH < 0 ||
    cy - halfH > screenH
  );
}

/** Random point in the corridor where the train should pass to drop coins. */
function pickPassPoint(zone: TrainSpawnZone, trainW: number, trainH: number) {
  const marginX = Math.min(trainW * 0.22, (zone.right - zone.left) * 0.12);
  const passX = randBetween(zone.left + marginX, zone.right - marginX);
  const passY = randBetween(
    zone.top - trainH * 0.48,
    zone.top + (zone.bottom - zone.top) * 0.28,
  );
  return { passX, passY };
}

/** Ray from (cx,cy) along (vx,vy) must intersect the estate corridor. */
export function pathCrossesEstateDropZone(
  cx: number,
  cy: number,
  vx: number,
  vy: number,
  zone: TrainSpawnZone,
  trainW: number,
  trainH: number,
) {
  const halfW = trainW * 0.52;
  const halfH = trainH * 0.52;
  const zLeft = zone.left - halfW * 0.08;
  const zRight = zone.right + halfW * 0.08;
  const zTop = zone.top - trainH * 0.62;
  const zBottom = zone.bottom + halfH * 0.28;

  if (Math.abs(vx) < 1e-4 && Math.abs(vy) < 1e-4) return false;

  let tMin = 0;
  let tMax = Number.POSITIVE_INFINITY;

  if (Math.abs(vx) > 1e-4) {
    const t1 = (zLeft - cx) / vx;
    const t2 = (zRight - cx) / vx;
    tMin = Math.max(tMin, Math.min(t1, t2));
    tMax = Math.min(tMax, Math.max(t1, t2));
  } else if (cx < zLeft || cx > zRight) {
    return false;
  }

  if (Math.abs(vy) > 1e-4) {
    const t1 = (zTop - cy) / vy;
    const t2 = (zBottom - cy) / vy;
    tMin = Math.max(tMin, Math.min(t1, t2));
    tMax = Math.min(tMax, Math.max(t1, t2));
  } else if (cy < zTop || cy > zBottom) {
    return false;
  }

  return tMax >= tMin && tMax > 0;
}

function buildHorizontalSpawn(
  fromLeft: boolean,
  passY: number,
  screenW: number,
  trainW: number,
  trainH: number,
  speed: number,
): TrainSpawnPlan {
  const halfW = trainW * 0.5;
  const pad = Math.max(trainW, trainH) * 0.18;
  const laneJitter = trainH * 0.38;
  const cy = passY + randBetween(-laneJitter, laneJitter);

  return {
    cx: fromLeft
      ? -halfW - pad - randBetween(0, halfW * 0.35)
      : screenW + halfW + pad + randBetween(0, halfW * 0.35),
    cy,
    vx: fromLeft ? speed : -speed,
    vy: 0,
  };
}

/**
 * Spawn off-screen left or right; path crosses the estate horizontally.
 */
export function pickRandomTrainSpawn(
  screenW: number,
  screenH: number,
  trainW: number,
  trainH: number,
  zone: TrainSpawnZone,
): TrainSpawnPlan {
  const speed = MONEY_TRAIN_SPEED_PX * randBetween(0.82, 1.15);

  for (let attempt = 0; attempt < 14; attempt += 1) {
    const { passY } = pickPassPoint(zone, trainW, trainH);
    const fromLeft = Math.random() < 0.5;
    const plan = buildHorizontalSpawn(fromLeft, passY, screenW, trainW, trainH, speed);

    if (pathCrossesEstateDropZone(plan.cx, plan.cy, plan.vx, plan.vy, zone, trainW, trainH)) {
      return plan;
    }
  }

  const { passY } = pickPassPoint(zone, trainW, trainH);
  const fromLeft = Math.random() < 0.5;
  return buildHorizontalSpawn(fromLeft, passY, screenW, trainW, trainH, speed);
}
