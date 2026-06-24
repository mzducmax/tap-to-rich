/**
 * Canvas gold impact burst — no extra DOM nodes (key 11 / [O]).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { BUTTERFLY_BURST_MS, GOLD_NUGGET_MAX_HIT_PARTICLES } from '../config/butterflyConfig';

type ParticleKind = 'ring' | 'spark' | 'shard';

type HitParticle = {
  active: boolean;
  kind: ParticleKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  born: number;
  life: number;
  size: number;
  rot: number;
  spin: number;
  hue: number;
};

const pool: HitParticle[] = Array.from({ length: GOLD_NUGGET_MAX_HIT_PARTICLES }, () => ({
  active: false,
  kind: 'spark',
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  born: 0,
  life: 0,
  size: 0,
  rot: 0,
  spin: 0,
  hue: 0,
}));

const freeStack: number[] = Array.from({ length: GOLD_NUGGET_MAX_HIT_PARTICLES }, (_, i) => i);
let freeCount = GOLD_NUGGET_MAX_HIT_PARTICLES;

function acquire(): HitParticle | null {
  if (freeCount === 0) return null;
  const slot = pool[freeStack[--freeCount]!]!;
  slot.active = true;
  return slot;
}

function release(idx: number) {
  pool[idx]!.active = false;
  freeStack[freeCount++] = idx;
}

function fadeAlpha(t: number) {
  return Math.pow(Math.max(0, 1 - t), 0.55);
}

export function spawnGoldNuggetHitEffect(x: number, y: number, seed: number) {
  const now = performance.now();
  let s = Math.abs(Math.floor(seed)) % 2147483647;
  const rng = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };

  for (let r = 0; r < 2; r += 1) {
    const ring = acquire();
    if (!ring) continue;
    ring.kind = 'ring';
    ring.x = x;
    ring.y = y;
    ring.vx = r * 38;
    ring.vy = 0;
    ring.born = now + ring.vx;
    ring.life = BUTTERFLY_BURST_MS * (0.85 + r * 0.12);
    ring.size = 52 + r * 28;
    ring.rot = 0;
    ring.spin = 0;
    ring.hue = 0;
  }

  const sparkCount = 10;
  for (let i = 0; i < sparkCount; i += 1) {
    const p = acquire();
    if (!p) break;
    const ang = (i / sparkCount) * Math.PI * 2 + rng() * 0.5;
    const speed = 180 + rng() * 260;
    p.kind = 'spark';
    p.x = x;
    p.y = y;
    p.vx = Math.cos(ang) * speed;
    p.vy = Math.sin(ang) * speed - 60;
    p.born = now;
    p.life = BUTTERFLY_BURST_MS * (0.7 + rng() * 0.35);
    p.size = 4 + rng() * 5;
    p.rot = 0;
    p.spin = 0;
    p.hue = rng();
  }

  const shardCount = 6;
  for (let i = 0; i < shardCount; i += 1) {
    const p = acquire();
    if (!p) break;
    const ang = rng() * Math.PI * 2;
    const speed = 120 + rng() * 200;
    p.kind = 'shard';
    p.x = x;
    p.y = y;
    p.vx = Math.cos(ang) * speed;
    p.vy = Math.sin(ang) * speed - 40;
    p.born = now;
    p.life = BUTTERFLY_BURST_MS * (0.75 + rng() * 0.4);
    p.size = 7 + rng() * 8;
    p.rot = rng() * Math.PI * 2;
    p.spin = (rng() * 2 - 1) * 9;
    p.hue = rng();
  }
}

export function hasActiveGoldNuggetHitEffects(now: number) {
  for (const p of pool) {
    if (!p.active) continue;
    if (now - p.born < p.life) return true;
  }
  return false;
}

export function clearGoldNuggetHitEffects() {
  for (let i = 0; i < pool.length; i += 1) {
    pool[i]!.active = false;
  }
  freeCount = GOLD_NUGGET_MAX_HIT_PARTICLES;
  for (let i = 0; i < GOLD_NUGGET_MAX_HIT_PARTICLES; i += 1) {
    freeStack[i] = i;
  }
}

export function tickGoldNuggetHitEffects(now: number, dt: number) {
  for (let i = 0; i < pool.length; i += 1) {
    const p = pool[i]!;
    if (!p.active) continue;
    if (now - p.born >= p.life) {
      release(i);
      continue;
    }
    if (p.kind !== 'ring') {
      p.vy += 420 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.spin * dt;
    }
  }
}

export function drawGoldNuggetHitEffects(ctx: CanvasRenderingContext2D, now: number) {
  for (const p of pool) {
    if (!p.active || now < p.born) continue;
    const t = (now - p.born) / p.life;
    if (t >= 1) continue;
    const alpha = fadeAlpha(t);

    if (p.kind === 'ring') {
      const scale = 0.25 + t * 2.8;
      ctx.save();
      ctx.globalAlpha = alpha * 0.9;
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.92)';
      ctx.lineWidth = 3.5 * (1 - t * 0.35);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * scale * 0.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      continue;
    }

    if (p.kind === 'spark') {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.hue > 0.5 ? '#fef08a' : '#fbbf24';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1 - t * 0.25), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      continue;
    }

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    const w = p.size;
    const h = p.size * 0.55;
    const grad = ctx.createLinearGradient(-w * 0.5, 0, w * 0.5, 0);
    grad.addColorStop(0, '#fde047');
    grad.addColorStop(1, '#b45309');
    ctx.fillStyle = grad;
    ctx.fillRect(-w * 0.5, -h * 0.5, w, h);
    ctx.restore();
  }
}
