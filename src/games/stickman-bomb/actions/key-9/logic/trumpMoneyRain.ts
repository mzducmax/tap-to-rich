/**
 * Full-screen falling $1000 Trump bills — pooled drawImage, 1 composited draw call.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import {
  TRUMP_MONEY_RAIN_BILL_WIDTH,
  TRUMP_MONEY_RAIN_MAX_SPEED,
  TRUMP_MONEY_RAIN_MIN_SPEED,
  TRUMP_MONEY_RAIN_POOL,
  TRUMP_MONEY_RAIN_SPAWN_INTERVAL_MS,
} from '../config/trumpSpawnConfig';

type RainBill = {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  rotation: number;
  spin: number;
  swayPhase: number;
  born: number;
};

const pool: RainBill[] = Array.from({ length: TRUMP_MONEY_RAIN_POOL }, () => ({
  active: false,
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  w: 0,
  h: 0,
  rotation: 0,
  spin: 0,
  swayPhase: 0,
  born: 0,
}));

let rainLive = false;
let spawning = false;
let screenW = 0;
let screenH = 0;
let lastSpawnMs = 0;
let billAspect = 1.5;

function acquire(): RainBill | null {
  const slot = pool.find((p) => !p.active);
  if (!slot) return null;
  slot.active = true;
  return slot;
}

function spawnBill(now: number): RainBill | null {
  if (screenW <= 0 || screenH <= 0) return null;

  const bill = acquire();
  if (!bill) return null;

  const w = TRUMP_MONEY_RAIN_BILL_WIDTH * (0.72 + Math.random() * 0.56);
  const h = w / billAspect;

  bill.x = Math.random() * (screenW + w) - w * 0.5;
  bill.y = -h - Math.random() * screenH * 0.35;
  bill.w = w;
  bill.h = h;
  bill.vx = (Math.random() - 0.5) * 42;
  bill.vy =
    TRUMP_MONEY_RAIN_MIN_SPEED +
    Math.random() * (TRUMP_MONEY_RAIN_MAX_SPEED - TRUMP_MONEY_RAIN_MIN_SPEED);
  bill.rotation = (Math.random() - 0.5) * 0.55;
  bill.spin = (Math.random() > 0.5 ? 1 : -1) * (0.35 + Math.random() * 1.1);
  bill.swayPhase = Math.random() * Math.PI * 2;
  bill.born = now;
  return bill;
}

export function setTrumpMoneyRainBillAspect(aspect: number) {
  if (aspect > 0.2) billAspect = aspect;
}

export function startTrumpMoneyRain(width: number, height: number, now: number) {
  screenW = width;
  screenH = height;
  rainLive = true;
  spawning = true;
  lastSpawnMs = now - TRUMP_MONEY_RAIN_SPAWN_INTERVAL_MS;

  for (const p of pool) {
    p.active = false;
  }

  const preSpawn = Math.min(28, TRUMP_MONEY_RAIN_POOL - 4);
  for (let i = 0; i < preSpawn; i += 1) {
    const bill = spawnBill(now);
    if (bill) {
      bill.y = Math.random() * screenH * 0.92 - bill.h;
    }
  }
}

export function stopTrumpMoneyRainSpawning() {
  spawning = false;
}

export function clearTrumpMoneyRain() {
  rainLive = false;
  spawning = false;
  for (const p of pool) {
    p.active = false;
  }
}

export function hasActiveTrumpMoneyRain() {
  if (!rainLive) return false;
  if (spawning) return true;
  return pool.some((p) => p.active);
}

export function resizeTrumpMoneyRain(width: number, height: number) {
  screenW = width;
  screenH = height;
}

export function updateTrumpMoneyRain(now: number, dtMs: number) {
  if (!rainLive) return;

  if (spawning && now - lastSpawnMs >= TRUMP_MONEY_RAIN_SPAWN_INTERVAL_MS) {
    lastSpawnMs = now;
    spawnBill(now);
    if (Math.random() < 0.38) spawnBill(now);
  }

  const dt = Math.min(48, dtMs) * 0.001;

  for (const p of pool) {
    if (!p.active) continue;

    p.vy += 28 * dt;
    p.x += (p.vx + Math.sin(now * 0.0018 + p.swayPhase) * 18) * dt;
    p.y += p.vy * dt;
    p.rotation += p.spin * dt;

    if (p.y - p.h > screenH + 24 || p.x + p.w < -40 || p.x - p.w > screenW + 40) {
      if (spawning) {
        spawnBill(now);
        p.active = false;
      } else {
        p.active = false;
      }
    }
  }

  if (!spawning && !pool.some((p) => p.active)) {
    rainLive = false;
  }
}

export function drawTrumpMoneyRain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  globalAlpha: number,
) {
  if (!rainLive || globalAlpha <= 0) return;
  if (!img.complete || img.naturalWidth <= 0) return;

  ctx.save();
  ctx.globalAlpha = globalAlpha;

  for (const p of pool) {
    if (!p.active) continue;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.drawImage(img, -p.w * 0.5, -p.h * 0.5, p.w, p.h);
    ctx.restore();
  }

  ctx.restore();
}
