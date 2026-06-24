/**
 * 2D rigid-body helpers — OBB corners, SAT, impulse resolution.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export type Vec2 = { x: number; y: number };

export type RigidBox = {
  x: number;
  y: number;
  w: number;
  h: number;
  angle: number;
  vx: number;
  vy: number;
  omega: number;
  invMass: number;
  invInertia: number;
};

const TMP_CORNERS_A: Vec2[] = [
  { x: 0, y: 0 },
  { x: 0, y: 0 },
  { x: 0, y: 0 },
  { x: 0, y: 0 },
];
const TMP_CORNERS_B: Vec2[] = [
  { x: 0, y: 0 },
  { x: 0, y: 0 },
  { x: 0, y: 0 },
  { x: 0, y: 0 },
];

export function boxInertia(mass: number, w: number, h: number): number {
  return (mass * (w * w + h * h)) / 12;
}

export function fillBoxCorners(
  out: Vec2[],
  x: number,
  y: number,
  w: number,
  h: number,
  angle: number,
): Vec2[] {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const hw = w * 0.5;
  const hh = h * 0.5;
  const lx = [-hw, hw, hw, -hw];
  const ly = [-hh, -hh, hh, hh];

  for (let i = 0; i < 4; i += 1) {
    out[i]!.x = x + lx[i]! * cos - ly[i]! * sin;
    out[i]!.y = y + lx[i]! * sin + ly[i]! * cos;
  }
  return out;
}

function projectInterval(corners: Vec2[], axisX: number, axisY: number): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  for (const c of corners) {
    const p = c.x * axisX + c.y * axisY;
    if (p < min) min = p;
    if (p > max) max = p;
  }
  return [min, max];
}

function intervalOverlap(a: [number, number], b: [number, number]): number {
  return Math.min(a[1], b[1]) - Math.max(a[0], b[0]);
}

export type SatResult = {
  depth: number;
  nx: number;
  ny: number;
};

export function satObb(a: RigidBox, b: RigidBox): SatResult | null {
  fillBoxCorners(TMP_CORNERS_A, a.x, a.y, a.w, a.h, a.angle);
  fillBoxCorners(TMP_CORNERS_B, b.x, b.y, b.w, b.h, b.angle);

  const axes = [
    [Math.cos(a.angle), Math.sin(a.angle)],
    [-Math.sin(a.angle), Math.cos(a.angle)],
    [Math.cos(b.angle), Math.sin(b.angle)],
    [-Math.sin(b.angle), Math.cos(b.angle)],
  ] as const;

  let minDepth = Infinity;
  let bestNx = 0;
  let bestNy = 0;

  for (const [ax, ay] of axes) {
    const len = Math.hypot(ax, ay);
    const nx = ax / len;
    const ny = ay / len;
    const ia = projectInterval(TMP_CORNERS_A, nx, ny);
    const ib = projectInterval(TMP_CORNERS_B, nx, ny);
    const overlap = intervalOverlap(ia, ib);
    if (overlap <= 0) return null;
    if (overlap < minDepth) {
      minDepth = overlap;
      bestNx = nx;
      bestNy = ny;
    }
  }

  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (dx * bestNx + dy * bestNy < 0) {
    bestNx = -bestNx;
    bestNy = -bestNy;
  }

  return { depth: minDepth, nx: bestNx, ny: bestNy };
}

export function lowestCornerY(box: RigidBox): number {
  fillBoxCorners(TMP_CORNERS_A, box.x, box.y, box.w, box.h, box.angle);
  let maxY = -Infinity;
  for (const c of TMP_CORNERS_A) {
    if (c.y > maxY) maxY = c.y;
  }
  return maxY;
}

export function highestCornerY(box: RigidBox): number {
  fillBoxCorners(TMP_CORNERS_A, box.x, box.y, box.w, box.h, box.angle);
  let minY = Infinity;
  for (const c of TMP_CORNERS_A) {
    if (c.y < minY) minY = c.y;
  }
  return minY;
}

export function resolveObbCollision(
  a: RigidBox,
  b: RigidBox,
  hit: SatResult,
  restitution: number,
  friction: number,
): void {
  const { nx, ny, depth } = hit;
  const invMassSum = a.invMass + b.invMass;
  if (invMassSum <= 0) return;

  const slop = 0.45;
  const percent = 0.62;
  const correction = (Math.max(depth - slop, 0) * percent) / invMassSum;
  a.x -= correction * nx * a.invMass;
  a.y -= correction * ny * a.invMass;
  b.x += correction * nx * b.invMass;
  b.y += correction * ny * b.invMass;

  const armA = a.w * 0.28;
  const armB = b.w * 0.28;
  const rvn =
    (b.vx - a.vx) * nx +
    (b.vy - a.vy) * ny +
    b.omega * armB -
    a.omega * armA;
  if (rvn > 0) return;

  const invDen =
    invMassSum +
    a.invInertia * armA * armA +
    b.invInertia * armB * armB;
  if (invDen <= 0) return;

  let j = (-(1 + restitution) * rvn) / invDen;
  j = Math.max(-5000, Math.min(5000, j));

  const ix = j * nx;
  const iy = j * ny;
  a.vx -= ix * a.invMass;
  a.vy -= iy * a.invMass;
  a.omega -= a.invInertia * armA * j;
  b.vx += ix * b.invMass;
  b.vy += iy * b.invMass;
  b.omega += b.invInertia * armB * j;

  const tvx = b.vx - a.vx;
  const tvy = b.vy - a.vy;
  const tLen = Math.hypot(tvx, tvy);
  if (tLen < 1e-3) return;

  const tx = tvx / tLen;
  const ty = tvy / tLen;
  const vTan = tvx * tx + tvy * ty;
  let jt = (-vTan * 0.85) / invMassSum;
  const maxF = Math.abs(j) * friction;
  jt = Math.max(-maxF, Math.min(maxF, jt));

  const fx = jt * tx;
  const fy = jt * ty;
  a.vx -= fx * a.invMass;
  a.vy -= fy * a.invMass;
  b.vx += fx * b.invMass;
  b.vy += fy * b.invMass;
}

export function resolveFloorCollision(
  box: RigidBox,
  floorY: number,
  restitution: number,
  friction: number,
): boolean {
  const bottom = lowestCornerY(box);
  const penetration = bottom - floorY;
  if (penetration <= 0) return false;

  box.y -= penetration;

  if (box.vy > 0) {
    box.vy = -box.vy * restitution;
    box.vx *= 1 - friction * 0.35;
    box.omega *= 1 - friction * 0.25;
    if (Math.abs(box.vy) < 18) box.vy = 0;
  }
  return true;
}

export function resolveWallCollision(
  box: RigidBox,
  minX: number,
  maxX: number,
  restitution: number,
  friction: number,
): void {
  fillBoxCorners(TMP_CORNERS_A, box.x, box.y, box.w, box.h, box.angle);
  let left = Infinity;
  let right = -Infinity;
  for (const c of TMP_CORNERS_A) {
    if (c.x < left) left = c.x;
    if (c.x > right) right = c.x;
  }

  if (left < minX) {
    box.x += minX - left;
    if (box.vx < 0) {
      box.vx = -box.vx * restitution;
      box.omega *= 1 - friction * 0.2;
    }
  }
  if (right > maxX) {
    box.x -= right - maxX;
    if (box.vx > 0) {
      box.vx = -box.vx * restitution;
      box.omega *= 1 - friction * 0.2;
    }
  }
}
