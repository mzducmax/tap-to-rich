/**
 * Pooled flying dollar coins + golden burst (key 9) — baked sprite drawImage.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import {
  TRUMP_BURST_COIN_COUNT,
  TRUMP_BURST_COIN_POOL,
  TRUMP_BURST_MS,
} from '../config/trumpSpawnConfig';
import {
  drawBakedDollarCoin,
  drawTrumpGoldenFlash,
  drawTrumpGoldenRing,
} from './trumpCoinSprite';

type BurstCoin = {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  born: number;
  life: number;
  size: number;
  angle: number;
  spin: number;
};

const pool: BurstCoin[] = Array.from({ length: TRUMP_BURST_COIN_POOL }, () => ({
  active: false,
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  born: 0,
  life: 0,
  size: 0,
  angle: 0,
  spin: 0,
}));

let burstOrigin = { x: 0, y: 0 };
let burstStart = 0;
let burstLive = false;

function acquire(): BurstCoin | null {
  const slot = pool.find((p) => !p.active);
  if (!slot) return null;
  slot.active = true;
  return slot;
}

export function startTrumpCoinBurst(cx: number, cy: number, now: number) {
  burstOrigin = { x: cx, y: cy };
  burstStart = now;
  burstLive = true;

  for (const p of pool) {
    p.active = false;
  }

  for (let i = 0; i < TRUMP_BURST_COIN_COUNT; i += 1) {
    const coin = acquire();
    if (!coin) break;
    const a = (i / TRUMP_BURST_COIN_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const speed = 200 + Math.random() * 380;
    coin.x = cx + (Math.random() - 0.5) * 12;
    coin.y = cy + (Math.random() - 0.5) * 12;
    coin.vx = Math.cos(a) * speed;
    coin.vy = Math.sin(a) * speed - (50 + Math.random() * 90);
    coin.born = now + Math.random() * 35;
    coin.life = 560 + Math.random() * 340;
    coin.size = 12 + Math.random() * 10;
    coin.angle = Math.random() * Math.PI * 2;
    coin.spin = (Math.random() > 0.5 ? 1 : -1) * (7 + Math.random() * 16);
  }
}

export function clearTrumpCoinBurst() {
  burstLive = false;
  for (const p of pool) {
    p.active = false;
  }
}

export function hasActiveTrumpCoinBurst(now: number) {
  if (!burstLive) return false;
  if (now - burstStart < TRUMP_BURST_MS) return true;
  return pool.some((p) => p.active && now >= p.born && now - p.born < p.life);
}

export function drawTrumpCoinBurst(
  ctx: CanvasRenderingContext2D,
  now: number,
  globalAlpha: number,
) {
  if (!burstLive) return;

  const burstAge = now - burstStart;
  const burstT = Math.min(1, burstAge / TRUMP_BURST_MS);

  drawTrumpGoldenFlash(ctx, burstOrigin.x, burstOrigin.y, burstT, globalAlpha);
  drawTrumpGoldenRing(ctx, burstOrigin.x, burstOrigin.y, burstT, globalAlpha, 100);
  drawTrumpGoldenRing(ctx, burstOrigin.x, burstOrigin.y, Math.min(1, burstT * 1.15), globalAlpha * 0.7, 130);

  for (const p of pool) {
    if (!p.active || now < p.born) continue;

    const elapsed = now - p.born;
    if (elapsed >= p.life) {
      p.active = false;
      continue;
    }

    const t = elapsed / p.life;
    const alpha = globalAlpha * Math.pow(Math.max(0, 1 - t), 0.4);
    const px = p.x + p.vx * elapsed * 0.00135;
    const py = p.y + p.vy * elapsed * 0.00135 + elapsed * 0.028;
    const wobble = Math.sin(elapsed * 0.012 + p.angle) * 2.5;
    const spin = p.angle + p.spin * elapsed * 0.001;
    const radius = p.size * (0.92 + Math.sin(elapsed * 0.018) * 0.08);

    drawBakedDollarCoin(ctx, px, py + wobble, radius, spin, alpha);
  }

  if (burstAge > TRUMP_BURST_MS && !pool.some((p) => p.active && now >= p.born && now - p.born < p.life)) {
    burstLive = false;
  }
}
