/**
 * Canvas tomato splat burst — bursting red juice, no extra DOM nodes (key 13 / [U]).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { TOMATO_BURST_MS, TOMATO_MAX_HIT_PARTICLES } from '../config/tomatoConfig';
import type { VeggieVariant } from './tomatoSprite';

// splotch — the spreading central pulp smear that stays put and soaks in.
// droplet — a round blob of juice flung outward under gravity.
// drip — an elongated streak of juice that stretches as it flies.
type ParticleKind = 'splotch' | 'droplet' | 'drip';

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
  variant: VeggieVariant;
};

const pool: HitParticle[] = Array.from({ length: TOMATO_MAX_HIT_PARTICLES }, () => ({
  active: false,
  kind: 'droplet',
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
  variant: 'tomato',
}));

const freeStack: number[] = Array.from({ length: TOMATO_MAX_HIT_PARTICLES }, (_, i) => i);
let freeCount = TOMATO_MAX_HIT_PARTICLES;

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
  return Math.pow(Math.max(0, 1 - t), 0.6);
}

/** Deep-to-bright juice palette per veggie, keyed by a per-particle 0..1 hue seed. */
const JUICE_PALETTES: Record<VeggieVariant, [string, string, string]> = {
  tomato: ['153, 17, 9', '220, 38, 38', '255, 138, 107'],
  banana: ['166, 118, 12', '232, 168, 20', '255, 224, 130'],
  cabbage: ['52, 96, 24', '111, 168, 58', '199, 232, 148'],
};

function juiceColor(variant: VeggieVariant, hue: number, alpha: number) {
  const [deep, mid, bright] = JUICE_PALETTES[variant];
  if (hue > 0.72) return `rgba(${bright}, ${alpha})`;
  if (hue > 0.4) return `rgba(${mid}, ${alpha})`;
  return `rgba(${deep}, ${alpha})`;
}

export function spawnTomatoHitEffect(
  x: number,
  y: number,
  seed: number,
  variant: VeggieVariant = 'tomato',
) {
  const now = performance.now();
  let s = Math.abs(Math.floor(seed)) % 2147483647;
  const rng = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };

  // Central pulp smear(s) — a couple of overlapping blobs that soak in.
  for (let r = 0; r < 3; r += 1) {
    const p = acquire();
    if (!p) break;
    p.kind = 'splotch';
    p.x = x + (rng() * 2 - 1) * 14;
    p.y = y + (rng() * 2 - 1) * 12;
    p.vx = 0;
    p.vy = 0;
    p.born = now;
    p.life = TOMATO_BURST_MS * (0.9 + rng() * 0.35);
    p.size = 30 + rng() * 34;
    p.rot = rng() * Math.PI * 2;
    p.spin = 0;
    p.hue = rng() * 0.4; // deep pulp
    p.variant = variant;
  }

  // Round juice droplets sprayed outward, pulled down by gravity.
  const dropletCount = 16;
  for (let i = 0; i < dropletCount; i += 1) {
    const p = acquire();
    if (!p) break;
    const ang = (i / dropletCount) * Math.PI * 2 + rng() * 0.6;
    const speed = 150 + rng() * 320;
    p.kind = 'droplet';
    p.x = x;
    p.y = y;
    p.vx = Math.cos(ang) * speed;
    p.vy = Math.sin(ang) * speed - 80;
    p.born = now;
    p.life = TOMATO_BURST_MS * (0.7 + rng() * 0.4);
    p.size = 4 + rng() * 9;
    p.rot = 0;
    p.spin = 0;
    p.hue = 0.4 + rng() * 0.6;
    p.variant = variant;
  }

  // Long stretchy juice streaks — the "splash lines" radiating from impact.
  const dripCount = 7;
  for (let i = 0; i < dripCount; i += 1) {
    const p = acquire();
    if (!p) break;
    const ang = rng() * Math.PI * 2;
    const speed = 220 + rng() * 260;
    p.kind = 'drip';
    p.x = x;
    p.y = y;
    p.vx = Math.cos(ang) * speed;
    p.vy = Math.sin(ang) * speed - 60;
    p.born = now;
    p.life = TOMATO_BURST_MS * (0.7 + rng() * 0.35);
    p.size = 6 + rng() * 6;
    p.rot = ang;
    p.spin = 0;
    p.hue = 0.3 + rng() * 0.5;
    p.variant = variant;
  }
}

export function hasActiveTomatoHitEffects(now: number) {
  for (const p of pool) {
    if (!p.active) continue;
    if (now - p.born < p.life) return true;
  }
  return false;
}

export function clearTomatoHitEffects() {
  for (let i = 0; i < pool.length; i += 1) {
    pool[i]!.active = false;
  }
  freeCount = TOMATO_MAX_HIT_PARTICLES;
  for (let i = 0; i < TOMATO_MAX_HIT_PARTICLES; i += 1) {
    freeStack[i] = i;
  }
}

export function tickTomatoHitEffects(now: number, dt: number) {
  for (let i = 0; i < pool.length; i += 1) {
    const p = pool[i]!;
    if (!p.active) continue;
    if (now - p.born >= p.life) {
      release(i);
      continue;
    }
    if (p.kind === 'splotch') continue;
    // Gravity drags the flying juice down; air drag slows the spray.
    p.vy += 900 * dt;
    p.vx *= 1 - 1.6 * dt;
    p.vy *= 1 - 0.4 * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.kind === 'drip') {
      // Point the streak along its current travel direction.
      p.rot = Math.atan2(p.vy, p.vx);
    }
  }
}

export function drawTomatoHitEffects(ctx: CanvasRenderingContext2D, now: number) {
  for (const p of pool) {
    if (!p.active || now < p.born) continue;
    const t = (now - p.born) / p.life;
    if (t >= 1) continue;
    const alpha = fadeAlpha(t);

    if (p.kind === 'splotch') {
      // Grows quickly then holds — an irregular soaked-in pulp mark.
      const scale = 0.5 + Math.min(1, t * 4) * 0.9;
      ctx.save();
      ctx.globalAlpha = alpha * 0.85;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(scale, scale * 0.82);
      const grad = ctx.createRadialGradient(0, 0, p.size * 0.1, 0, 0, p.size);
      grad.addColorStop(0, juiceColor(p.variant, 0.5, 0.95));
      grad.addColorStop(0.6, juiceColor(p.variant, 0.2, 0.8));
      grad.addColorStop(1, juiceColor(p.variant, 0, 0));
      ctx.fillStyle = grad;
      ctx.beginPath();
      // Lumpy blob outline.
      const lobes = 9;
      for (let i = 0; i <= lobes; i += 1) {
        const a = (i / lobes) * Math.PI * 2;
        const wobble = 0.72 + ((Math.sin(a * 3 + p.rot * 5) + 1) * 0.5) * 0.5;
        const rr = p.size * wobble;
        const px = Math.cos(a) * rr;
        const py = Math.sin(a) * rr;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      continue;
    }

    if (p.kind === 'droplet') {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = juiceColor(p.variant, p.hue, 1);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1 - t * 0.3), 0, Math.PI * 2);
      ctx.fill();
      // Tiny wet highlight.
      ctx.globalAlpha = alpha * 0.5;
      ctx.fillStyle = 'rgba(255, 220, 210, 0.9)';
      ctx.beginPath();
      ctx.arc(p.x - p.size * 0.25, p.y - p.size * 0.25, p.size * 0.28, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      continue;
    }

    // drip — a stretched teardrop streak aligned with travel.
    const speed = Math.hypot(p.vx, p.vy);
    const len = p.size + Math.min(46, speed * 0.06);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    const grad = ctx.createLinearGradient(-len, 0, p.size, 0);
    grad.addColorStop(0, juiceColor(p.variant, 0, 0));
    grad.addColorStop(1, juiceColor(p.variant, p.hue, 1));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(-len, 0);
    ctx.quadraticCurveTo(0, -p.size * 0.55, p.size, 0);
    ctx.quadraticCurveTo(0, p.size * 0.55, -len, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
