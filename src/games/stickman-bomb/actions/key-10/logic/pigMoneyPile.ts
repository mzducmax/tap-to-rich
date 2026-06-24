/**
 * Falling money stacks — 2D rigid-body pile (gravity, SAT collisions, sleep).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import {
  MONEY_PHYSICS_AIR_DRAG,
  MONEY_PHYSICS_ANGULAR_DRAG,
  MONEY_PHYSICS_FRICTION,
  MONEY_PHYSICS_GRAVITY,
  MONEY_PHYSICS_RESTITUTION,
  MONEY_PHYSICS_SLEEP_ANGULAR,
  MONEY_PHYSICS_SLEEP_FRAMES,
  MONEY_PHYSICS_SLEEP_SPEED,
  MONEY_PHYSICS_SUBSTEPS,
  MONEY_STACK_POOL,
  MONEY_STACK_SPAWN_BURST,
  MONEY_STACK_SPAWN_INTERVAL_MS,
  MONEY_STACK_WIDTH,
  PILE_FILL_RATIO,
} from '../config/pigBankConfig';
import {
  boxInertia,
  highestCornerY,
  resolveFloorCollision,
  resolveObbCollision,
  resolveWallCollision,
  satObb,
  type RigidBox,
} from './pigMoneyPhysics';

type StackBill = RigidBox & {
  active: boolean;
  sleeping: boolean;
  sleepCounter: number;
  mass: number;
};

const pool: StackBill[] = Array.from({ length: MONEY_STACK_POOL }, () => ({
  active: false,
  sleeping: false,
  sleepCounter: 0,
  mass: 1,
  x: 0,
  y: 0,
  w: 0,
  h: 0,
  angle: 0,
  vx: 0,
  vy: 0,
  omega: 0,
  invMass: 1,
  invInertia: 1,
}));

let pileLive = false;
let spawning = false;
let pileFull = false;
let screenW = 0;
let screenH = 0;
let lastSpawnMs = 0;
let billAspect = 1.15;
let pileTopY = Infinity;

function acquire(): StackBill | null {
  const slot = pool.find((p) => !p.active);
  if (!slot) return null;
  slot.active = true;
  return slot;
}

function wakeBody(body: StackBill) {
  if (!body.sleeping) return;
  body.sleeping = false;
  body.invMass = 1 / body.mass;
  body.invInertia = 1 / boxInertia(body.mass, body.w, body.h);
  body.sleepCounter = 0;
}

function sleepBody(body: StackBill) {
  body.sleeping = true;
  body.vx = 0;
  body.vy = 0;
  body.omega = 0;
  body.invMass = 0;
  body.invInertia = 0;
  body.sleepCounter = 0;
}

function spawnStack(now: number): StackBill | null {
  if (screenW <= 0 || screenH <= 0 || pileFull) return null;

  const bill = acquire();
  if (!bill) return null;

  const w = MONEY_STACK_WIDTH * (0.7 + Math.random() * 0.45);
  const h = w / billAspect;
  const mass = w * h * 0.0012;

  bill.mass = mass;
  bill.invMass = 1 / mass;
  bill.invInertia = 1 / boxInertia(mass, w, h);
  bill.sleeping = false;
  bill.sleepCounter = 0;
  bill.x = w * 0.5 + Math.random() * (screenW - w);
  bill.y = -h * 0.5 - Math.random() * screenH * 0.08;
  bill.w = w;
  bill.h = h;
  bill.angle = (Math.random() - 0.5) * 0.9;
  bill.vx = (Math.random() - 0.5) * 55;
  bill.vy = 18 + Math.random() * 42;
  bill.omega = (Math.random() > 0.5 ? 1 : -1) * (0.8 + Math.random() * 2.4);
  bill.active = true;
  void now;
  return bill;
}

function measurePileTop(): number {
  let top = screenH;
  for (const p of pool) {
    if (!p.active) continue;
    top = Math.min(top, highestCornerY(p));
  }
  return top;
}

function checkPileFull() {
  pileTopY = measurePileTop();
  const pileHeight = screenH - pileTopY;
  if (pileHeight >= screenH * PILE_FILL_RATIO) {
    pileFull = true;
    spawning = false;
  }
}

function integrateBody(body: StackBill, dt: number) {
  if (body.sleeping) return;

  body.vy += MONEY_PHYSICS_GRAVITY * dt;
  const drag = Math.exp(-MONEY_PHYSICS_AIR_DRAG * dt);
  body.vx *= drag;
  body.vy *= drag;
  body.omega *= Math.exp(-MONEY_PHYSICS_ANGULAR_DRAG * dt);

  body.x += body.vx * dt;
  body.y += body.vy * dt;
  body.angle += body.omega * dt;
}

function collidePair(a: StackBill, b: StackBill) {
  if (a.sleeping && b.sleeping) return;

  const hit = satObb(a, b);
  if (!hit) return;

  resolveObbCollision(a, b, hit, MONEY_PHYSICS_RESTITUTION, MONEY_PHYSICS_FRICTION);

  if (a.sleeping && !b.sleeping) wakeBody(b);
  if (b.sleeping && !a.sleeping) wakeBody(a);
}

// --- Spatial hash grid (broad-phase) ---------------------------------------
// Avoids the O(n²) all-pairs scan: each bill is bucketed into grid cells by its
// bounding box, and only bills sharing a cell are tested. This is what keeps a
// dense pile of hundreds of bills cheap when money spawns in bulk.
const GRID_CELL = MONEY_STACK_WIDTH * 1.15;
const gridBuckets = new Map<number, StackBill[]>();
const scratchColliders: StackBill[] = [];

function cellKey(cx: number, cy: number): number {
  // Pack two 16-bit signed cell coords into one number key.
  return ((cx + 0x8000) << 16) | ((cy + 0x8000) & 0xffff);
}

function rebuildGrid(colliders: StackBill[]) {
  gridBuckets.clear();
  const inv = 1 / GRID_CELL;
  for (const body of colliders) {
    const halfW = (Math.abs(body.w) + Math.abs(body.h)) * 0.5;
    const minCx = Math.floor((body.x - halfW) * inv);
    const maxCx = Math.floor((body.x + halfW) * inv);
    const minCy = Math.floor((body.y - halfW) * inv);
    const maxCy = Math.floor((body.y + halfW) * inv);
    for (let cx = minCx; cx <= maxCx; cx += 1) {
      for (let cy = minCy; cy <= maxCy; cy += 1) {
        const key = cellKey(cx, cy);
        let bucket = gridBuckets.get(key);
        if (!bucket) {
          bucket = [];
          gridBuckets.set(key, bucket);
        }
        bucket.push(body);
      }
    }
  }
}

const seenPairs = new Set<StackBill>();

function collideViaGrid(body: StackBill) {
  const inv = 1 / GRID_CELL;
  const halfW = (Math.abs(body.w) + Math.abs(body.h)) * 0.5;
  const minCx = Math.floor((body.x - halfW) * inv);
  const maxCx = Math.floor((body.x + halfW) * inv);
  const minCy = Math.floor((body.y - halfW) * inv);
  const maxCy = Math.floor((body.y + halfW) * inv);

  seenPairs.clear();
  for (let cx = minCx; cx <= maxCx; cx += 1) {
    for (let cy = minCy; cy <= maxCy; cy += 1) {
      const bucket = gridBuckets.get(cellKey(cx, cy));
      if (!bucket) continue;
      for (const other of bucket) {
        if (other === body || seenPairs.has(other)) continue;
        seenPairs.add(other);
        collidePair(body, other);
      }
    }
  }
}

function physicsSubstep(dt: number) {
  const floorY = screenH;
  const margin = 4;
  const activeBodies = pool.filter((p) => p.active && !p.sleeping);

  for (const body of activeBodies) {
    integrateBody(body, dt);
  }

  for (const body of activeBodies) {
    resolveWallCollision(body, margin, screenW - margin, MONEY_PHYSICS_RESTITUTION * 0.65, MONEY_PHYSICS_FRICTION);
    if (resolveFloorCollision(body, floorY, MONEY_PHYSICS_RESTITUTION, MONEY_PHYSICS_FRICTION)) {
      body.vx += (Math.random() - 0.5) * 6;
    }
  }

  scratchColliders.length = 0;
  for (const p of pool) {
    if (p.active) scratchColliders.push(p);
  }
  rebuildGrid(scratchColliders);

  // Only awake bills initiate collision tests; sleeping neighbours are woken
  // on contact inside collidePair.
  for (const body of scratchColliders) {
    if (body.sleeping) continue;
    collideViaGrid(body);
  }

  for (const body of activeBodies) {
    const speed = Math.hypot(body.vx, body.vy);
    const ang = Math.abs(body.omega);
    if (speed < MONEY_PHYSICS_SLEEP_SPEED && ang < MONEY_PHYSICS_SLEEP_ANGULAR) {
      body.sleepCounter += 1;
      if (body.sleepCounter >= MONEY_PHYSICS_SLEEP_FRAMES) {
        sleepBody(body);
      }
    } else {
      body.sleepCounter = 0;
    }
  }
}

export function setPigMoneyStackAspect(aspect: number) {
  if (aspect > 0.2) billAspect = aspect;
}

export function startPigMoneyPile(width: number, height: number, now: number) {
  screenW = width;
  screenH = height;
  pileLive = true;
  spawning = true;
  pileFull = false;
  pileTopY = height;
  lastSpawnMs = now - MONEY_STACK_SPAWN_INTERVAL_MS;

  for (const p of pool) {
    p.active = false;
    p.sleeping = false;
    p.sleepCounter = 0;
  }
}

export function stopPigMoneyPileSpawning() {
  spawning = false;
}

export function clearPigMoneyPile() {
  pileLive = false;
  spawning = false;
  pileFull = false;
  pileTopY = Infinity;
  for (const p of pool) {
    p.active = false;
    p.sleeping = false;
    p.sleepCounter = 0;
  }
}

export function isPigPileFull() {
  return pileFull;
}

export function hasActivePigMoneyPile() {
  if (!pileLive) return false;
  if (spawning) return true;
  return pool.some((p) => p.active);
}

export function hasUnsettledPigMoney() {
  return pool.some((p) => p.active && !p.sleeping);
}

export function resizePigMoneyPile(width: number, height: number) {
  if (width <= 0 || height <= 0) return;

  const prevW = screenW;
  const prevH = screenH;
  if (prevW <= 0 || prevH <= 0) {
    screenW = width;
    screenH = height;
    return;
  }

  const scaleX = width / prevW;
  const scaleY = height / prevH;
  screenW = width;
  screenH = height;

  for (const p of pool) {
    if (!p.active) continue;
    p.x *= scaleX;
    p.y *= scaleY;
    p.w *= scaleX;
    p.h *= scaleY;
    p.vx *= scaleX;
    p.vy *= scaleY;
    if (!p.sleeping) {
      p.mass = p.w * p.h * 0.0012;
      p.invMass = 1 / p.mass;
      p.invInertia = 1 / boxInertia(p.mass, p.w, p.h);
    }
  }

  checkPileFull();
}

export function updatePigMoneyPile(now: number, dtMs: number) {
  if (!pileLive) return;

  if (spawning && !pileFull && now - lastSpawnMs >= MONEY_STACK_SPAWN_INTERVAL_MS) {
    lastSpawnMs = now;
    for (let i = 0; i < MONEY_STACK_SPAWN_BURST; i += 1) {
      if (!spawnStack(now)) break;
    }
  }

  const dt = Math.min(32, dtMs) * 0.001;
  const subDt = dt / MONEY_PHYSICS_SUBSTEPS;

  for (let s = 0; s < MONEY_PHYSICS_SUBSTEPS; s += 1) {
    physicsSubstep(subDt);
  }

  if (!pileFull) checkPileFull();
}

export type PigBillView = {
  x: number;
  y: number;
  w: number;
  h: number;
  angle: number;
};

/**
 * Copy the current active bills into `out` (reused objects, no allocation) for
 * GPU sprite rendering. Returns the number of live bills written.
 */
export function readPigMoneyBills(out: PigBillView[]): number {
  let n = 0;
  for (const p of pool) {
    if (!p.active) continue;
    let view = out[n];
    if (!view) {
      view = { x: 0, y: 0, w: 0, h: 0, angle: 0 };
      out[n] = view;
    }
    view.x = p.x;
    view.y = p.y;
    view.w = p.w;
    view.h = p.h;
    view.angle = p.angle;
    n += 1;
  }
  return n;
}

export function drawPigMoneyPile(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  globalAlpha: number,
) {
  if (!pileLive || globalAlpha <= 0) return;
  if (!img.complete || img.naturalWidth <= 0) return;

  ctx.save();
  ctx.globalAlpha = globalAlpha;

  const sorted = pool.filter((p) => p.active);
  sorted.sort((a, b) => a.y - b.y);

  for (const p of sorted) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.drawImage(img, -p.w * 0.5, -p.h * 0.5, p.w, p.h);
    ctx.restore();
  }

  ctx.restore();
}
