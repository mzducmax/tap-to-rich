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
  for (const p of m.smoke) {
    const age = (now - p.born) / MISSILE_SMOKE_LIFE_MS;
    if (age >= 1) continue;
    const alpha = (1 - age) * 0.42;
    const r = p.baseR * (0.7 + age * 1.8);
    const y = p.y - age * 14 + p.drift * age * 20;
    const grad = ctx.createRadialGradient(p.x, y, 0, p.x, y, Math.max(1, r));
    grad.addColorStop(0, `rgba(214, 211, 209, ${alpha})`);
    grad.addColorStop(0.6, `rgba(168, 162, 158, ${alpha * 0.6})`);
    grad.addColorStop(1, 'rgba(120, 113, 108, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x, y, Math.max(1, r), 0, TWO_PI);
    ctx.fill();
  }
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

function drawExplosion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  e: number,
  seed: number,
) {
  const grow = easeOutCubic(e);
  const alpha = 1 - e;
  const radius = grow * MISSILE_EXPLOSION_RADIUS;

  // Expanding shockwave ring.
  ctx.strokeStyle = `rgba(255, 226, 160, ${0.55 * alpha})`;
  ctx.lineWidth = 2 + (1 - e) * 5;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TWO_PI);
  ctx.stroke();

  // Fireball core.
  const coreR = radius * 0.72;
  const core = ctx.createRadialGradient(x, y, 0, x, y, Math.max(1, coreR));
  core.addColorStop(0, `rgba(255, 255, 224, ${alpha})`);
  core.addColorStop(0.42, `rgba(255, 162, 44, ${0.92 * alpha})`);
  core.addColorStop(1, 'rgba(196, 40, 18, 0)');
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(1, coreR), 0, TWO_PI);
  ctx.fill();

  // Outward sparks.
  const sparks = 11;
  ctx.strokeStyle = `rgba(255, 210, 120, ${0.85 * alpha})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < sparks; i++) {
    const a = seed + (i / sparks) * TWO_PI;
    const inner = radius * 0.55;
    const outer = radius * (0.95 + ((i * 13) % 7) / 18);
    ctx.moveTo(x + Math.cos(a) * inner, y + Math.sin(a) * inner);
    ctx.lineTo(x + Math.cos(a) * outer, y + Math.sin(a) * outer);
  }
  ctx.stroke();
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

  // Pass 1 — smoke trail, painted normally (greyscale, sits under the rocket).
  ctx.globalCompositeOperation = 'source-over';
  for (let i = 0; i < missiles.length; i++) {
    const m = missiles[i]!;
    updateSmoke(m, now, (now - m.startTime) / m.flightDuration);
    drawSmoke(ctx, m, now);
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
