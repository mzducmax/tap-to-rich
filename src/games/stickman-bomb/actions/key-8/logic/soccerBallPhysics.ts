/**
 * Phased ball physics — estate hit then edge ricochet (key 8).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import {
  SOCCER_BALL_EDGE_SPEED,
  SOCCER_BALL_FRICTION,
  SOCCER_BALL_GRAVITY,
  SOCCER_BALL_RESTITUTION,
} from '../config/soccerBallConfig';

export type Rect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export type EdgeSide = 'top' | 'right' | 'bottom' | 'left';

export type BallBody = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
};

export type BallPhase = 'incoming' | 'edgeRun';

export type BallSimState = {
  body: BallBody;
  phase: BallPhase;
  targetEdge: EdgeSide | null;
  estateHit: boolean;
  /** Allows the next estate impact to score (debounced while overlapping). */
  estateReentryReady: boolean;
  edgeBounceCount: number;
};

export type PhysicsWorld = {
  bounds: Rect;
  estate: Rect;
  gravity: number;
  restitution: number;
  friction: number;
};

export type PhysicsStepResult = {
  hitEstate: boolean;
  hitEdge: EdgeSide | null;
};

const EDGE_SIDES: EdgeSide[] = ['top', 'right', 'bottom', 'left'];

function pickRandomEdge(): EdgeSide {
  return EDGE_SIDES[Math.floor(Math.random() * EDGE_SIDES.length)]!;
}

function edgeTargetPoint(bounds: Rect, edge: EdgeSide, radius: number) {
  const w = bounds.right - bounds.left;
  const h = bounds.bottom - bounds.top;
  const cx = bounds.left + w * 0.5;
  const cy = bounds.top + h * 0.5;
  const jitterX = (Math.random() - 0.5) * w * 0.35;
  const jitterY = (Math.random() - 0.5) * h * 0.35;

  switch (edge) {
    case 'top':
      return { x: cx + jitterX, y: bounds.top + radius + 2 };
    case 'bottom':
      return { x: cx + jitterX, y: bounds.bottom - radius - 2 };
    case 'left':
      return { x: bounds.left + radius + 2, y: cy + jitterY };
    default:
      return { x: bounds.right - radius - 2, y: cy + jitterY };
  }
}

export function aimBodyAtPoint(body: BallBody, tx: number, ty: number, speed: number) {
  const dx = tx - body.x;
  const dy = ty - body.y;
  const dist = Math.hypot(dx, dy) || 1;
  body.vx = (dx / dist) * speed;
  body.vy = (dy / dist) * speed;
}

export function launchTowardEdge(
  body: BallBody,
  bounds: Rect,
  edge: EdgeSide,
  speed: number,
) {
  const target = edgeTargetPoint(bounds, edge, body.radius);
  aimBodyAtPoint(body, target.x, target.y, speed);
}

function reflectCircleOnAabb(
  body: BallBody,
  rect: Rect,
  restitution: number,
  friction: number,
): boolean {
  const closestX = Math.max(rect.left, Math.min(body.x, rect.right));
  const closestY = Math.max(rect.top, Math.min(body.y, rect.bottom));

  const dx = body.x - closestX;
  const dy = body.y - closestY;
  const distSq = dx * dx + dy * dy;
  const r = body.radius;

  if (distSq >= r * r) return false;

  let nx: number;
  let ny: number;
  let overlap: number;

  if (distSq < 1e-8) {
    const penLeft = body.x - rect.left;
    const penRight = rect.right - body.x;
    const penTop = body.y - rect.top;
    const penBottom = rect.bottom - body.y;
    const minPen = Math.min(penLeft, penRight, penTop, penBottom);

    if (minPen === penLeft) {
      nx = -1;
      ny = 0;
      overlap = r + penLeft;
    } else if (minPen === penRight) {
      nx = 1;
      ny = 0;
      overlap = r + penRight;
    } else if (minPen === penTop) {
      nx = 0;
      ny = -1;
      overlap = r + penTop;
    } else {
      nx = 0;
      ny = 1;
      overlap = r + penBottom;
    }
  } else {
    const dist = Math.sqrt(distSq);
    nx = dx / dist;
    ny = dy / dist;
    overlap = r - dist;
  }

  body.x += nx * overlap;
  body.y += ny * overlap;

  const vDotN = body.vx * nx + body.vy * ny;
  if (vDotN >= 0) return true;

  body.vx -= (1 + restitution) * vDotN * nx;
  body.vy -= (1 + restitution) * vDotN * ny;

  const tx = -ny;
  const ty = nx;
  const vDotT = body.vx * tx + body.vy * ty;
  body.vx -= vDotT * friction * tx;
  body.vy -= vDotT * friction * ty;

  return true;
}

function isCircleClearOfAabb(body: BallBody, rect: Rect, margin = 10): boolean {
  const closestX = Math.max(rect.left, Math.min(body.x, rect.right));
  const closestY = Math.max(rect.top, Math.min(body.y, rect.bottom));
  const dx = body.x - closestX;
  const dy = body.y - closestY;
  return Math.hypot(dx, dy) >= body.radius + margin;
}

function resolveCircleBounds(
  body: BallBody,
  bounds: Rect,
  restitution: number,
): EdgeSide | null {
  const r = body.radius;
  let hit: EdgeSide | null = null;

  if (body.x - r < bounds.left) {
    body.x = bounds.left + r;
    body.vx = Math.abs(body.vx) * restitution;
    hit = 'left';
  } else if (body.x + r > bounds.right) {
    body.x = bounds.right - r;
    body.vx = -Math.abs(body.vx) * restitution;
    hit = 'right';
  }

  if (body.y - r < bounds.top) {
    body.y = bounds.top + r;
    body.vy = Math.abs(body.vy) * restitution;
    hit = 'top';
  } else if (body.y + r > bounds.bottom) {
    body.y = bounds.bottom - r;
    body.vy = -Math.abs(body.vy) * restitution;
    hit = 'bottom';
  }

  return hit;
}

export function createDefaultPhysicsWorld(bounds: Rect, estate: Rect): PhysicsWorld {
  return {
    bounds,
    estate,
    gravity: SOCCER_BALL_GRAVITY,
    restitution: SOCCER_BALL_RESTITUTION,
    friction: SOCCER_BALL_FRICTION,
  };
}

export function createBallSimState(body: BallBody): BallSimState {
  return {
    body,
    phase: 'incoming',
    targetEdge: null,
    estateHit: false,
    estateReentryReady: false,
    edgeBounceCount: 0,
  };
}

export function stepBallSim(
  sim: BallSimState,
  world: PhysicsWorld,
  dt: number,
): PhysicsStepResult {
  const { body } = sim;
  let hitEstate = false;
  let hitEdge: EdgeSide | null = null;

  if (sim.phase === 'incoming') {
    body.vy += world.gravity * dt;
    body.x += body.vx * dt;
    body.y += body.vy * dt;

    if (
      reflectCircleOnAabb(body, world.estate, world.restitution, world.friction) &&
      !sim.estateHit
    ) {
      sim.estateHit = true;
      sim.estateReentryReady = false;
      hitEstate = true;
      sim.phase = 'edgeRun';
      sim.targetEdge = pickRandomEdge();
      launchTowardEdge(body, world.bounds, sim.targetEdge, SOCCER_BALL_EDGE_SPEED);
    }
  } else {
    body.x += body.vx * dt;
    body.y += body.vy * dt;

    if (
      reflectCircleOnAabb(body, world.estate, world.restitution, world.friction) &&
      sim.estateReentryReady
    ) {
      hitEstate = true;
      sim.estateReentryReady = false;
    }

    if (isCircleClearOfAabb(body, world.estate)) {
      sim.estateReentryReady = true;
    }

    hitEdge = resolveCircleBounds(body, world.bounds, world.restitution);
    if (hitEdge) {
      sim.edgeBounceCount += 1;
    }
  }

  return { hitEstate, hitEdge };
}

export function ballSpeed(body: BallBody) {
  return Math.hypot(body.vx, body.vy);
}
