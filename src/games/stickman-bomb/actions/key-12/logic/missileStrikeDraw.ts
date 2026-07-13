/**
 * Frame painter for missiles + explosions — all active items drawn in one pass
 * onto the shared offscreen Canvas2D (uploaded as a single GPU texture).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import {
  MISSILE_EXPLOSION_RADIUS,
  MISSILE_LENGTH,
  MISSILE_SMOKE_EMIT_MS,
  MISSILE_SMOKE_LIFE_MS,
  MISSILE_WIDTH,
} from '../config/missileStrikeConfig';

export type SmokePuff = {
  x: number;
  y: number;
  born: number;
  baseR: number;
  drift: number;
};

export type MissileDrawState = {
  id: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  /** Cubic Bézier control points — give the flight its curved swoop. */
  c1x: number;
  c1y: number;
  c2x: number;
  c2y: number;
  seed: number;
  startTime: number;
  flightDuration: number;
  explodeDuration: number;
  struck: boolean;
  smoke: SmokePuff[];
  lastSmokeAt: number;
};

const TWO_PI = Math.PI * 2;

/**
 * Pre-rendered radial sprites, built once and blitted with drawImage each
 * frame. Rasterizing radial gradients per puff/per frame was the hot path;
 * a cached sprite blit is a plain textured quad for the canvas backend.
 */
const SPRITE_SIZE = 128;

type FxSprites = {
  trail: HTMLCanvasElement;
  fire: HTMLCanvasElement;
  flash: HTMLCanvasElement;
  smoke: HTMLCanvasElement;
};

let fxSprites: FxSprites | null = null;

function makeRadialSprite(stops: Array<[number, string]>): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = SPRITE_SIZE;
  canvas.height = SPRITE_SIZE;
  const ctx = canvas.getContext('2d')!;
  const half = SPRITE_SIZE / 2;
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
  for (const [offset, color] of stops) grad.addColorStop(offset, color);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  return canvas;
}

function getFxSprites(): FxSprites {
  if (fxSprites) return fxSprites;
  fxSprites = {
    // Grey exhaust-trail puff (matches the old per-frame gradient colours).
    trail: makeRadialSprite([
      [0, 'rgba(214, 211, 209, 1)'],
      [0.6, 'rgba(168, 162, 158, 0.6)'],
      [1, 'rgba(120, 113, 108, 0)'],
    ]),
    // Fireball blob — white-hot core cooling to transparent deep red.
    fire: makeRadialSprite([
      [0, 'rgba(255, 255, 228, 1)'],
      [0.22, 'rgba(255, 226, 120, 0.96)'],
      [0.5, 'rgba(255, 148, 38, 0.8)'],
      [0.78, 'rgba(226, 70, 18, 0.4)'],
      [1, 'rgba(160, 30, 10, 0)'],
    ]),
    // Impact flash — near-white burst that dies in the first frames.
    flash: makeRadialSprite([
      [0, 'rgba(255, 255, 255, 1)'],
      [0.35, 'rgba(255, 244, 214, 0.85)'],
      [1, 'rgba(255, 220, 160, 0)'],
    ]),
    // Dark aftermath smoke.
    smoke: makeRadialSprite([
      [0, 'rgba(82, 78, 75, 0.9)'],
      [0.55, 'rgba(68, 64, 61, 0.55)'],
      [1, 'rgba(50, 47, 45, 0)'],
    ]),
  };
  return fxSprites;
}

/** Deterministic pseudo-random in [0,1) from the missile seed — no per-frame allocation. */
function rand01(seed: number, i: number): number {
  const x = Math.sin(seed * 127.1 + i * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function easeInQuad(t: number): number {
  return t * t;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** 0 → 1 across the whole flight + explosion lifetime (used for pruning). */
export function missileProgressRaw(m: MissileDrawState, now: number): number {
  return (now - m.startTime) / (m.flightDuration + m.explodeDuration);
}

function cubic(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

function cubicTangent(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const u = 1 - t;
  return 3 * u * u * (p1 - p0) + 6 * u * t * (p2 - p1) + 3 * t * t * (p3 - p2);
}

/** Position + heading along the curved Bézier path at flight progress `flightT`. */
function missileFlightState(m: MissileDrawState, flightT: number) {
  const t = easeInQuad(Math.max(0, Math.min(1, flightT)));
  const x = cubic(m.startX, m.c1x, m.c2x, m.targetX, t);
  const y = cubic(m.startY, m.c1y, m.c2y, m.targetY, t);
  const tx = cubicTangent(m.startX, m.c1x, m.c2x, m.targetX, t);
  const ty = cubicTangent(m.startY, m.c1y, m.c2y, m.targetY, t);
  return { x, y, angle: Math.atan2(ty, tx) };
}

/** Emit a fresh puff at the rocket tail and age existing ones (in place). */
function updateSmoke(m: MissileDrawState, now: number, flightT: number) {
  if (flightT < 1 && now - m.lastSmokeAt >= MISSILE_SMOKE_EMIT_MS) {
    const state = missileFlightState(m, flightT);
    const tailX = state.x - Math.cos(state.angle) * (MISSILE_LENGTH * 0.5);
    const tailY = state.y - Math.sin(state.angle) * (MISSILE_LENGTH * 0.5);
    m.smoke.push({
      x: tailX + (Math.random() - 0.5) * MISSILE_WIDTH,
      y: tailY + (Math.random() - 0.5) * MISSILE_WIDTH,
      born: now,
      baseR: MISSILE_WIDTH * (0.6 + Math.random() * 0.5),
      drift: (Math.random() - 0.5) * 0.4,
    });
    m.lastSmokeAt = now;
  }

  for (let i = m.smoke.length - 1; i >= 0; i--) {
    if (now - m.smoke[i]!.born >= MISSILE_SMOKE_LIFE_MS) m.smoke.splice(i, 1);
  }
}

function drawSmoke(ctx: CanvasRenderingContext2D, m: MissileDrawState, now: number) {
  const trail = getFxSprites().trail;
  for (const p of m.smoke) {
    const age = (now - p.born) / MISSILE_SMOKE_LIFE_MS;
    if (age >= 1) continue;
    const r = Math.max(1, p.baseR * (0.7 + age * 1.8));
    const y = p.y - age * 14 + p.drift * age * 20;
    ctx.globalAlpha = (1 - age) * 0.42;
    ctx.drawImage(trail, p.x - r, y - r, r * 2, r * 2);
  }
  ctx.globalAlpha = 1;
}

function drawRocket(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  flicker: number,
) {
  const halfL = MISSILE_LENGTH / 2;
  const halfW = MISSILE_WIDTH / 2;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Exhaust flame trailing behind the tail.
  const flameLen = 26 + flicker * 10;
  const flame = ctx.createLinearGradient(-halfL - flameLen, 0, -halfL, 0);
  flame.addColorStop(0, 'rgba(255, 180, 40, 0)');
  flame.addColorStop(0.55, 'rgba(255, 140, 20, 0.55)');
  flame.addColorStop(1, 'rgba(255, 244, 190, 0.95)');
  ctx.fillStyle = flame;
  ctx.beginPath();
  ctx.moveTo(-halfL, -halfW * 0.6);
  ctx.lineTo(-halfL - flameLen, 0);
  ctx.lineTo(-halfL, halfW * 0.6);
  ctx.closePath();
  ctx.fill();

  // Body.
  ctx.fillStyle = '#e5e7eb';
  ctx.beginPath();
  ctx.moveTo(-halfL, -halfW);
  ctx.lineTo(halfL * 0.45, -halfW);
  ctx.lineTo(halfL * 0.45, halfW);
  ctx.lineTo(-halfL, halfW);
  ctx.closePath();
  ctx.fill();

  // Nose cone.
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.moveTo(halfL * 0.45, -halfW);
  ctx.lineTo(halfL, 0);
  ctx.lineTo(halfL * 0.45, halfW);
  ctx.closePath();
  ctx.fill();

  // Tail fins.
  ctx.fillStyle = '#9ca3af';
  ctx.beginPath();
  ctx.moveTo(-halfL, -halfW);
  ctx.lineTo(-halfL - halfW * 0.7, -halfW * 1.7);
  ctx.lineTo(-halfL + halfW * 0.6, -halfW);
  ctx.closePath();
  ctx.moveTo(-halfL, halfW);
  ctx.lineTo(-halfL - halfW * 0.7, halfW * 1.7);
  ctx.lineTo(-halfL + halfW * 0.6, halfW);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/** Dark rising smoke column after the fireball — drawn in the source-over pass. */
function drawExplosionSmoke(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  e: number,
  seed: number,
) {
  if (e < 0.22) return;
  const smoke = getFxSprites().smoke;
  const s = (e - 0.22) / 0.78;
  const alpha = Math.sin(Math.min(1, s) * Math.PI) * 0.55;
  const puffs = 5;
  for (let i = 0; i < puffs; i++) {
    const spread = (rand01(seed, i + 71) - 0.5) * MISSILE_EXPLOSION_RADIUS * 0.7;
    const rise = s * (46 + rand01(seed, i + 83) * 60) + i * 9;
    const r =
      MISSILE_EXPLOSION_RADIUS * (0.28 + rand01(seed, i + 97) * 0.22) * (0.6 + s * 0.8);
    ctx.globalAlpha = alpha * (0.7 + rand01(seed, i + 41) * 0.3);
    ctx.drawImage(smoke, x + spread - r, y - rise - r, r * 2, r * 2);
  }
  ctx.globalAlpha = 1;
}

function drawExplosion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  e: number,
  seed: number,
) {
  const sprites = getFxSprites();
  const grow = easeOutCubic(e);
  const fade = 1 - e;
  const radius = grow * MISSILE_EXPLOSION_RADIUS;

  // 1. Impact flash — big white burst gone within the first ~15%.
  if (e < 0.15) {
    const f = 1 - e / 0.15;
    const fr = MISSILE_EXPLOSION_RADIUS * (1.05 + (1 - f) * 0.5);
    ctx.globalAlpha = f * 0.95;
    ctx.drawImage(sprites.flash, x - fr, y - fr, fr * 2, fr * 2);
  }

  // 2. Double shockwave rings — leading ring plus a dimmer trailing one.
  ctx.globalAlpha = 0.6 * fade;
  ctx.strokeStyle = 'rgb(255, 226, 160)';
  ctx.lineWidth = 2 + fade * 6;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(1, radius * 1.04), 0, TWO_PI);
  ctx.stroke();
  if (e > 0.12) {
    ctx.globalAlpha = 0.3 * fade;
    ctx.lineWidth = 1.5 + fade * 3;
    ctx.beginPath();
    ctx.arc(x, y, Math.max(1, radius * 0.78), 0, TWO_PI);
    ctx.stroke();
  }

  // 3. Cauliflower fireball — hot core plus offset blobs so the ball reads
  // as rolling fire instead of a flat gradient disc.
  const coreR = Math.max(1, radius * 0.62);
  ctx.globalAlpha = fade;
  ctx.drawImage(sprites.fire, x - coreR, y - coreR, coreR * 2, coreR * 2);
  const blobs = 6;
  for (let i = 0; i < blobs; i++) {
    const a = (i / blobs) * TWO_PI + seed;
    const dist = coreR * (0.5 + rand01(seed, i) * 0.3) * grow;
    const br = Math.max(1, coreR * (0.42 + rand01(seed, i + 9) * 0.3));
    ctx.globalAlpha = fade * 0.85;
    ctx.drawImage(
      sprites.fire,
      x + Math.cos(a) * dist - br,
      y + Math.sin(a) * dist * 0.8 - br,
      br * 2,
      br * 2,
    );
  }

  // 4. Debris streaks — sparks flung outward, sagging under gravity.
  const sparks = 16;
  ctx.globalAlpha = 0.9 * fade;
  ctx.strokeStyle = 'rgb(255, 214, 130)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i < sparks; i++) {
    const a = seed + (i / sparks) * TWO_PI + (rand01(seed, i + 31) - 0.5) * 0.5;
    const reach = MISSILE_EXPLOSION_RADIUS * (0.8 + rand01(seed, i + 57) * 0.7);
    const d = reach * grow;
    const dropNow = e * e * 90;
    const px = x + Math.cos(a) * d;
    const py = y + Math.sin(a) * d + dropNow;
    // Short tail pointing back along the (curved) travel direction.
    const tail = 0.82;
    const tx = x + Math.cos(a) * d * tail;
    const ty = y + Math.sin(a) * d * tail + dropNow * tail * tail;
    ctx.moveTo(tx, ty);
    ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/**
 * Draw every active missile/explosion for `now`. Returns the indices of missiles
 * that crossed impact this frame (so the caller can fire their onImpact once).
 */
export function drawMissileFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dpr: number,
  missiles: MissileDrawState[],
  now: number,
): number[] {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const struck: number[] = [];
  const prevComposite = ctx.globalCompositeOperation;

  // Pass 1 — smoke, painted normally (greyscale, sits under the fire glow):
  // exhaust trail while flying, dark aftermath column once exploded.
  ctx.globalCompositeOperation = 'source-over';
  for (let i = 0; i < missiles.length; i++) {
    const m = missiles[i]!;
    const flightT = (now - m.startTime) / m.flightDuration;
    updateSmoke(m, now, flightT);
    drawSmoke(ctx, m, now);
    if (flightT >= 1) {
      const e = Math.min(1, (now - (m.startTime + m.flightDuration)) / m.explodeDuration);
      drawExplosionSmoke(ctx, m.targetX, m.targetY, e, m.seed);
    }
  }

  // Pass 2 — rocket bodies and explosions, additively blended for the glow.
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < missiles.length; i++) {
    const m = missiles[i]!;
    const flightT = (now - m.startTime) / m.flightDuration;

    if (flightT < 1) {
      const state = missileFlightState(m, flightT);
      const flicker = 0.5 + 0.5 * Math.sin(now * 0.05 + m.seed * 7);
      drawRocket(ctx, state.x, state.y, state.angle, flicker);
    } else {
      if (!m.struck) struck.push(i);
      const e = Math.min(1, (now - (m.startTime + m.flightDuration)) / m.explodeDuration);
      drawExplosion(ctx, m.targetX, m.targetY, e, m.seed);
    }
  }

  ctx.globalCompositeOperation = prevComposite;
  return struck;
}
