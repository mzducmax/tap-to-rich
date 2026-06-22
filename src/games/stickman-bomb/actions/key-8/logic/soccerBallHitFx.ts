/**
 * Canvas impact + roll dust for soccer ball (key 8).
 * Drawn on the same compositor canvas — no extra DOM nodes.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import {
  SOCCER_BALL_HIT_EFFECT_EDGE_MS,
  SOCCER_BALL_HIT_EFFECT_MS,
  SOCCER_BALL_MAX_HIT_PARTICLES,
} from '../config/soccerBallConfig';

type HitKind = 'estate' | 'edge';

type HitParticle = {
  active: boolean;
  kind: 'ring' | 'spark' | 'puff' | 'dust';
  hitKind: HitKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  born: number;
  life: number;
  size: number;
  angle: number;
};

const pool: HitParticle[] = Array.from({ length: SOCCER_BALL_MAX_HIT_PARTICLES }, () => ({
  active: false,
  kind: 'spark',
  hitKind: 'edge',
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  born: 0,
  life: 0,
  size: 0,
  angle: 0,
}));

// O(1) free-index stack — avoids O(N) pool.find on every acquire.
const freeStack: number[] = Array.from({ length: SOCCER_BALL_MAX_HIT_PARTICLES }, (_, i) => i);
let freeCount = SOCCER_BALL_MAX_HIT_PARTICLES;

function acquire(): HitParticle | null {
  if (freeCount === 0) return null;
  const slot = pool[freeStack[--freeCount]!]!;
  slot.active = true;
  return slot;
}

function releaseParticle(idx: number) {
  pool[idx]!.active = false;
  freeStack[freeCount++] = idx;
}

function fadeAlpha(t: number, power = 0.48) {
  return Math.pow(Math.max(0, 1 - t), power);
}

function impactScale(speed: number, strong: boolean) {
  const base = strong ? 1 : 0.88;
  const speedBoost = Math.min(1.45, 0.72 + speed / 1100);
  return base * speedBoost;
}

function spawnRing(
  x: number,
  y: number,
  hitKind: HitKind,
  now: number,
  life: number,
  size: number,
  delay = 0,
) {
  const ring = acquire();
  if (!ring) return;
  ring.kind = 'ring';
  ring.hitKind = hitKind;
  ring.x = x;
  ring.y = y;
  ring.vx = delay;
  ring.vy = 0;
  ring.born = now + delay;
  ring.life = life;
  ring.size = size;
  ring.angle = 0;
}

export function spawnSoccerBallHitEffect(
  x: number,
  y: number,
  hitKind: HitKind,
  impactSpeed = 1200,
) {
  const now = performance.now();
  const strong = hitKind === 'estate';
  const scale = impactScale(impactSpeed, strong);
  const baseLife = strong ? SOCCER_BALL_HIT_EFFECT_MS : SOCCER_BALL_HIT_EFFECT_EDGE_MS;

  spawnRing(x, y, hitKind, now, baseLife * scale, (strong ? 78 : 58) * scale);
  spawnRing(x, y, hitKind, now, baseLife * scale * 1.15, (strong ? 108 : 82) * scale, strong ? 45 : 35);

  const puff = acquire();
  if (puff) {
    puff.kind = 'puff';
    puff.hitKind = hitKind;
    puff.x = x;
    puff.y = y;
    puff.vx = 0;
    puff.vy = 0;
    puff.born = now;
    puff.life = (strong ? 420 : 340) * scale;
    puff.size = (strong ? 62 : 48) * scale;
    puff.angle = 0;
  }

  const shock = acquire();
  if (shock) {
    shock.kind = 'puff';
    shock.hitKind = hitKind;
    shock.x = x;
    shock.y = y;
    shock.vx = 0;
    shock.vy = 0;
    shock.born = now;
    shock.life = baseLife * 0.95;
    shock.size = (strong ? 92 : 70) * scale;
    shock.angle = 0;
  }

  const sparkCount = strong ? 16 : 11;
  for (let i = 0; i < sparkCount; i += 1) {
    const spark = acquire();
    if (!spark) break;
    const a = Math.random() * Math.PI * 2;
    const speed = (120 + Math.random() * (strong ? 260 : 190)) * scale;
    spark.kind = 'spark';
    spark.hitKind = hitKind;
    spark.x = x;
    spark.y = y;
    spark.vx = Math.cos(a) * speed;
    spark.vy = Math.sin(a) * speed;
    spark.born = now;
    spark.life = (280 + Math.random() * 320) * scale;
    spark.size = (2.5 + Math.random() * (strong ? 4.5 : 3.5)) * scale;
    spark.angle = a;
  }

  const dustCount = strong ? 8 : 5;
  for (let i = 0; i < dustCount; i += 1) {
    const dust = acquire();
    if (!dust) break;
    const a = Math.random() * Math.PI * 2;
    const speed = 24 + Math.random() * 55;
    dust.kind = 'dust';
    dust.hitKind = hitKind;
    dust.x = x + (Math.random() - 0.5) * 16 * scale;
    dust.y = y + (Math.random() - 0.5) * 16 * scale;
    dust.vx = Math.cos(a) * speed;
    dust.vy = Math.sin(a) * speed - 18;
    dust.born = now + Math.random() * 80;
    dust.life = (520 + Math.random() * 480) * scale;
    dust.size = (10 + Math.random() * 18) * scale;
    dust.angle = a;
  }
}

/** Wispy trail while the ball rolls/skims after a bounce. */
export function spawnSoccerBallRollDust(
  x: number,
  y: number,
  vx: number,
  vy: number,
  speed: number,
) {
  const now = performance.now();
  const scale = Math.min(1.35, 0.85 + speed / 1300);
  const backX = speed > 1e-3 ? x - (vx / speed) * 22 * scale : x;
  const backY = speed > 1e-3 ? y - (vy / speed) * 22 * scale : y;

  for (let i = 0; i < 3; i += 1) {
    const dust = acquire();
    if (!dust) break;
    dust.kind = 'dust';
    dust.hitKind = 'edge';
    dust.x = backX + (Math.random() - 0.5) * 20 * scale;
    dust.y = backY + (Math.random() - 0.5) * 20 * scale;
    dust.vx = (Math.random() - 0.5) * 36;
    dust.vy = -12 - Math.random() * 28;
    dust.born = now + i * 18;
    dust.life = 640 + Math.random() * 520;
    dust.size = 14 + Math.random() * 22 * scale;
    dust.angle = 0;
  }

  const wisp = acquire();
  if (wisp) {
    wisp.kind = 'puff';
    wisp.hitKind = 'edge';
    wisp.x = backX;
    wisp.y = backY;
    wisp.vx = 0;
    wisp.vy = 0;
    wisp.born = now;
    wisp.life = 380;
    wisp.size = 34 * scale;
    wisp.angle = 0;
  }
}

export function hasActiveSoccerBallHitEffects(now: number) {
  return freeCount < SOCCER_BALL_MAX_HIT_PARTICLES &&
    pool.some((p) => p.active && now >= p.born && now - p.born < p.life);
}

export function drawSoccerBallHitEffects(
  ctx: CanvasRenderingContext2D,
  now: number,
) {
  for (let i = 0; i < pool.length; i += 1) {
    const p = pool[i]!;
    if (!p.active || now < p.born) continue;

    const elapsed = now - p.born;
    if (elapsed >= p.life) {
      releaseParticle(i);
      continue;
    }

    const t = elapsed / p.life;
    const alpha = fadeAlpha(t);

    if (p.kind === 'ring') {
      const radius = p.size * (0.28 + t * 1.15);
      ctx.save();
      ctx.globalAlpha = alpha * (p.hitKind === 'estate' ? 0.92 : 0.72);
      ctx.strokeStyle = p.hitKind === 'estate' ? '#fef08a' : '#e2e8f0';
      ctx.lineWidth = (p.hitKind === 'estate' ? 4.5 : 3.2) * (1 - t * 0.35);
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.stroke();
      if (p.hitKind === 'estate' && t < 0.55) {
        ctx.globalAlpha = alpha * 0.35;
        ctx.lineWidth = 7;
        ctx.stroke();
      }
      ctx.restore();
      continue;
    }

    if (p.kind === 'puff') {
      const radius = p.size * (0.32 + t * 1.05);
      ctx.save();
      ctx.globalAlpha = alpha * (p.size > 60 ? 0.38 : 0.52);
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
      grad.addColorStop(0, 'rgba(255,255,255,0.98)');
      grad.addColorStop(0.35, 'rgba(255,255,255,0.42)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      continue;
    }

    if (p.kind === 'dust') {
      const px = p.x + p.vx * elapsed * 0.0012;
      const py = p.y + p.vy * elapsed * 0.0012 + elapsed * 0.012;
      const radius = p.size * (0.55 + t * 0.95);
      ctx.save();
      ctx.globalAlpha = alpha * 0.55;
      const grad = ctx.createRadialGradient(px, py, 0, px, py, radius);
      grad.addColorStop(0, 'rgba(248,250,252,0.75)');
      grad.addColorStop(0.5, 'rgba(203,213,225,0.28)');
      grad.addColorStop(1, 'rgba(148,163,184,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      continue;
    }

    const px = p.x + p.vx * elapsed * 0.0014;
    const py = p.y + p.vy * elapsed * 0.0014 + elapsed * 0.022;
    const sparkColor = p.hitKind === 'estate' ? '#fde047' : '#f8fafc';
    // Soft glow ring: larger arc at low alpha (replaces shadowBlur GPU pass).
    ctx.save();
    ctx.fillStyle = sparkColor;
    ctx.globalAlpha = alpha * 0.28;
    ctx.beginPath();
    ctx.arc(px, py, p.size * 2.4, 0, Math.PI * 2);
    ctx.fill();
    // Core spark.
    ctx.globalAlpha = alpha * 0.9;
    ctx.beginPath();
    ctx.arc(px, py, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export function clearSoccerBallHitEffects() {
  for (let i = 0; i < pool.length; i += 1) {
    if (pool[i]!.active) releaseParticle(i);
  }
}
