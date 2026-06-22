/**
 * Single-canvas batch renderer for flying arrows + burst particles.
 * One compositor layer, one draw pass per frame — replaces hundreds of DOM/img nodes.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { avatarStrikeArrowUrl } from '../config/avatarStrikeAssets';
import {
  AVATAR_STRIKE_LAUNCH_EFFECT_MS,
  AVATAR_STRIKE_STICK_EFFECT_MS,
} from '../config/avatarStrikeConfig';
import {
  AVATAR_STRIKE_MAX_FLIGHTS,
  AVATAR_STRIKE_MAX_PARTICLES,
} from '../config/avatarStrikePerformance';
import type { Point2 } from '../../shared/animationUtils';
import {
  ARROW_NOCK_PX,
  ARROW_SPRITE_NATIVE_W,
  ARROW_SPRITE_WIDTH,
  arrowFlightRotation,
  nockFromTip,
} from './avatarStrikeGeometry';
import {
  registerAvatarMotionTick,
  unregisterAvatarMotionTick,
} from './avatarMotionTicker';

const ARROW_NATIVE_H = 334;
const ARROW_DISPLAY_H = (ARROW_SPRITE_WIDTH * ARROW_NATIVE_H) / ARROW_SPRITE_NATIVE_W;
const STUCK_MS = 340;

type Flight = {
  id: number;
  groupId: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  angleRad: number;
  startTime: number;
  duration: number;
  resolve: () => void;
};

type StuckArrow = {
  nockX: number;
  nockY: number;
  angleRad: number;
  startTime: number;
};

type ParticleKind =
  | 'flash'
  | 'ring'
  | 'streak'
  | 'smoke'
  | 'spark'
  | 'impact'
  | 'stickFlash'
  | 'stickRing'
  | 'crack'
  | 'chip';

type Particle = {
  active: boolean;
  kind: ParticleKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  born: number;
  life: number;
  size: number;
  hue: number;
};

export type FlightGroup = number;

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let arrowImg: HTMLImageElement | null = null;
let arrowReady = false;

let cssW = 0;
let cssH = 0;
let dpr = 1;

const flights: Flight[] = [];
const stuckArrows: StuckArrow[] = [];
const particles: Particle[] = [];
const cancelledGroups = new Set<number>();

let nextFlightId = 1;
let nextGroupId = 1;
let tickRegistered = false;

function syncTicker() {
  const busy = flights.length > 0 || stuckArrows.length > 0 || particles.some((p) => p.active);
  if (busy && !tickRegistered) {
    registerAvatarMotionTick(tickCanvas);
    tickRegistered = true;
    return;
  }
  if (!busy && tickRegistered) {
    unregisterAvatarMotionTick(tickCanvas);
    tickRegistered = false;
  }
}

function acquireParticle(): Particle {
  const free = particles.find((p) => !p.active);
  if (free) return free;
  if (particles.length >= AVATAR_STRIKE_MAX_PARTICLES) {
    return particles[0];
  }
  const p: Particle = {
    active: false,
    kind: 'flash',
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    angle: 0,
    born: 0,
    life: 0,
    size: 0,
    hue: 45,
  };
  particles.push(p);
  return p;
}

function spawnParticle(init: Omit<Particle, 'active'> & { active?: boolean }) {
  const p = acquireParticle();
  Object.assign(p, init, { active: true });
  syncTicker();
}

function onArrowLoaded() {
  arrowReady = true;
  if (flights.length > 0 || stuckArrows.length > 0 || particles.some((p) => p.active)) {
    tickCanvas(performance.now());
  }
}

function loadArrowImage() {
  if (arrowImg && arrowReady) return;
  if (!arrowImg) {
    arrowImg = new Image();
    arrowImg.decoding = 'async';
    arrowImg.onload = onArrowLoaded;
    arrowImg.src = avatarStrikeArrowUrl;
  }
  if (arrowImg.complete && arrowImg.naturalWidth > 0) {
    onArrowLoaded();
  }
}

export function mountAvatarStrikeCanvas(el: HTMLCanvasElement) {
  if (canvas === el && ctx) return;
  unmountAvatarStrikeCanvas();

  loadArrowImage();
  canvas = el;
  ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
}

export function unmountAvatarStrikeCanvas() {
  for (const f of flights.splice(0)) f.resolve();
  stuckArrows.length = 0;
  for (const p of particles) p.active = false;
  cancelledGroups.clear();
  syncTicker();

  canvas = null;
  ctx = null;
  radialGradientCache.clear();
  streakGradientCache.clear();
}

export function resizeAvatarStrikeCanvas(width: number, height: number) {
  if (!canvas || !ctx) return;
  cssW = Math.max(1, width);
  cssH = Math.max(1, height);
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  canvas.style.width = `${cssW}px`;
  canvas.style.height = `${cssH}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

export function createFlightGroup(): FlightGroup {
  return nextGroupId++;
}

export function cancelFlightGroup(groupId: FlightGroup) {
  cancelledGroups.add(groupId);
  for (let i = flights.length - 1; i >= 0; i--) {
    if (flights[i].groupId !== groupId) continue;
    flights[i].resolve();
    flights.splice(i, 1);
  }
  syncTicker();
}

const GRADIENT_FADE_BUCKETS = 6;
const radialGradientCache = new Map<string, CanvasGradient>();
const streakGradientCache = new Map<string, CanvasGradient>();

function bucketFade(fade: number): number {
  return Math.min(
    GRADIENT_FADE_BUCKETS - 1,
    Math.max(0, Math.floor(fade * GRADIENT_FADE_BUCKETS)),
  );
}

function bucketSize(size: number): number {
  return Math.max(8, Math.round(size / 8) * 8);
}

function cachedRadialGradient(
  kind: 'flash' | 'impact' | 'stickFlash' | 'smoke',
  fadeBucket: number,
  radius: number,
): CanvasGradient | null {
  if (!ctx) return null;
  const fade = (fadeBucket + 0.5) / GRADIENT_FADE_BUCKETS;
  const key = `${kind}_${fadeBucket}_${radius}`;
  const hit = radialGradientCache.get(key);
  if (hit) return hit;

  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
  if (kind === 'impact') {
    g.addColorStop(0, `rgba(255,251,235,${0.95 * fade})`);
    g.addColorStop(0.38, `rgba(251,191,36,${0.55 * fade})`);
    g.addColorStop(0.58, `rgba(239,68,68,${0.15 * fade})`);
  } else if (kind === 'stickFlash') {
    g.addColorStop(0, `rgba(248,250,252,${0.95 * fade})`);
    g.addColorStop(0.55, `rgba(148,163,184,${0.45 * fade})`);
  } else if (kind === 'smoke') {
    g.addColorStop(0, `rgba(226,232,240,${0.55 * fade})`);
    g.addColorStop(0.5, `rgba(148,163,184,${0.2 * fade})`);
  } else {
    g.addColorStop(0, `rgba(255,254,240,${fade})`);
    g.addColorStop(0.28, `rgba(254,240,138,${0.95 * fade})`);
    g.addColorStop(0.52, `rgba(251,191,36,${0.45 * fade})`);
  }
  g.addColorStop(1, 'rgba(0,0,0,0)');
  radialGradientCache.set(key, g);
  return g;
}

function cachedStreakGradient(fadeBucket: number, len: number): CanvasGradient | null {
  if (!ctx) return null;
  const fade = (fadeBucket + 0.5) / GRADIENT_FADE_BUCKETS;
  const key = `${fadeBucket}_${len}`;
  const hit = streakGradientCache.get(key);
  if (hit) return hit;

  const g = ctx.createLinearGradient(0, 0, len, 0);
  g.addColorStop(0, `rgba(254,240,138,${fade})`);
  g.addColorStop(0.45, `rgba(251,191,36,${0.85 * fade})`);
  g.addColorStop(1, 'rgba(251,191,36,0)');
  streakGradientCache.set(key, g);
  return g;
}

function drawArrow(nockX: number, nockY: number, angleRad: number, scale = 1) {
  if (!ctx || !arrowImg || !arrowReady) return;
  const rot = arrowFlightRotation(angleRad);
  ctx.save();
  ctx.translate(nockX, nockY);
  ctx.rotate(rot);
  ctx.scale(scale, scale);
  ctx.drawImage(
    arrowImg,
    -ARROW_NOCK_PX.x,
    -ARROW_NOCK_PX.y,
    ARROW_SPRITE_WIDTH,
    ARROW_DISPLAY_H,
  );
  ctx.restore();
}

function drawParticle(p: Particle, now: number) {
  if (!ctx) return;
  const t = (now - p.born) / p.life;
  if (t >= 1) {
    p.active = false;
    return;
  }

  const fade = 1 - t * t;
  ctx.save();

  switch (p.kind) {
    case 'flash':
    case 'impact':
    case 'stickFlash': {
      const r = p.size * (0.2 + t * 1.65);
      const g = cachedRadialGradient(p.kind, bucketFade(fade), bucketSize(r));
      if (!g) break;
      ctx.translate(p.x, p.y);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'ring':
    case 'stickRing': {
      const r = p.size * (0.3 + t * 1.8);
      ctx.strokeStyle =
        p.kind === 'stickRing'
          ? `rgba(251,191,36,${0.75 * fade})`
          : `rgba(253,224,71,${0.9 * fade})`;
      ctx.lineWidth = p.kind === 'stickRing' ? 1.5 : 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'streak': {
      const len = bucketSize(p.size * (0.1 + t * 1.55));
      const grad = cachedStreakGradient(bucketFade(fade), len);
      if (!grad) break;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = grad;
      ctx.fillRect(0, -p.size * 0.08, len, p.size * 0.16);
      break;
    }
    case 'smoke': {
      const r = p.size * (0.4 + t * 1.2);
      const g = cachedRadialGradient('smoke', bucketFade(fade), bucketSize(r));
      if (!g) break;
      ctx.translate(p.x, p.y);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'spark': {
      const px = p.x + p.vx * t;
      const py = p.y + p.vy * t;
      ctx.fillStyle = `rgba(253,230,138,${fade})`;
      ctx.beginPath();
      ctx.arc(px, py, p.size * (0.2 + (1 - t) * 0.8), 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'crack': {
      const len = p.size * (0.15 + t * 1.05);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = `rgba(30,41,59,${0.75 * fade})`;
      ctx.fillRect(-len * 0.5, -1.5, len, 3);
      ctx.restore();
      break;
    }
    case 'chip': {
      const px = p.x + p.vx * t;
      const py = p.y + p.vy * t;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(p.angle + t * 0.5);
      ctx.fillStyle = `rgba(148,163,184,${fade})`;
      ctx.fillRect(-3.5, -3.5, 7, 7);
      ctx.restore();
      break;
    }
  }

  ctx.restore();
}

function tickCanvas(now: number) {
  if (!ctx || !canvas) return;

  ctx.clearRect(0, 0, cssW, cssH);

  for (let i = flights.length - 1; i >= 0; i--) {
    const f = flights[i];
    if (cancelledGroups.has(f.groupId)) continue;

    const raw = Math.min((now - f.startTime) / f.duration, 1);
    const p = 1 - (1 - raw) ** 2;
    const x = f.startX + (f.endX - f.startX) * p;
    const y = f.startY + (f.endY - f.startY) * p;

    drawArrow(x, y, f.angleRad);

    if (raw < 1) continue;

    stuckArrows.push({
      nockX: x,
      nockY: y,
      angleRad: f.angleRad,
      startTime: now,
    });
    f.resolve();
    flights.splice(i, 1);
  }

  for (let i = stuckArrows.length - 1; i >= 0; i--) {
    const s = stuckArrows[i];
    const elapsed = now - s.startTime;
    if (elapsed > STUCK_MS) {
      stuckArrows.splice(i, 1);
      continue;
    }
    const t = elapsed / STUCK_MS;
    const scale = t < 0.4 ? 1.1 - t * 0.4 : 0.94 + (t - 0.4) * 0.1;
    drawArrow(s.nockX, s.nockY, s.angleRad, scale);
  }

  for (const p of particles) {
    if (!p.active) continue;
    drawParticle(p, now);
  }

  syncTicker();
}

export function flyArrowCanvas(
  groupId: FlightGroup,
  nockStart: Point2,
  tipTarget: Point2,
  duration: number,
): Promise<void> {
  if (flights.length >= AVATAR_STRIKE_MAX_FLIGHTS) {
    return Promise.resolve();
  }

  const angleRad = Math.atan2(tipTarget.y - nockStart.y, tipTarget.x - nockStart.x);
  const nockEnd = nockFromTip(tipTarget, angleRad);
  const startTime = performance.now();

  return new Promise((resolve) => {
    flights.push({
      id: nextFlightId++,
      groupId,
      startX: nockStart.x,
      startY: nockStart.y,
      endX: nockEnd.x,
      endY: nockEnd.y,
      angleRad,
      startTime,
      duration,
      resolve,
    });
    syncTicker();
    tickCanvas(startTime);
  });
}

/** Launch burst — flash, rings, streaks, sparks (canvas particles). */
export function spawnLaunchBurstCanvas(origin: Point2, angleRad: number) {
  const now = performance.now();
  const life = AVATAR_STRIKE_LAUNCH_EFFECT_MS;

  spawnParticle({ kind: 'flash', x: origin.x, y: origin.y, vx: 0, vy: 0, angle: angleRad, born: now, life, size: 28, hue: 45 });
  spawnParticle({ kind: 'ring', x: origin.x, y: origin.y, vx: 0, vy: 0, angle: angleRad, born: now, life: life * 0.92, size: 24, hue: 45 });
  spawnParticle({ kind: 'streak', x: origin.x, y: origin.y, vx: 0, vy: 0, angle: angleRad, born: now, life: life * 0.78, size: 64, hue: 45 });
  spawnParticle({ kind: 'streak', x: origin.x, y: origin.y, vx: 0, vy: 0, angle: angleRad + 0.12, born: now, life: life * 0.72, size: 42, hue: 45 });
  spawnParticle({ kind: 'smoke', x: origin.x, y: origin.y, vx: 0, vy: 0, angle: angleRad, born: now, life: life * 0.85, size: 18, hue: 45 });

  const sparkDirs = [
    { vx: 44, vy: -32 },
    { vx: -40, vy: -24 },
    { vx: 16, vy: -52 },
    { vx: 56, vy: 8 },
  ];
  for (const d of sparkDirs) {
    spawnParticle({
      kind: 'spark',
      x: origin.x,
      y: origin.y,
      vx: d.vx,
      vy: d.vy,
      angle: angleRad,
      born: now,
      life: life * 0.88,
      size: 8,
      hue: 45,
    });
  }
}

/** Stick burst — impact, rings, crack, chips (canvas particles). */
export function spawnStickBurstCanvas(tip: Point2, angleRad: number) {
  const now = performance.now();
  const life = AVATAR_STRIKE_STICK_EFFECT_MS;

  spawnParticle({ kind: 'impact', x: tip.x, y: tip.y, vx: 0, vy: 0, angle: angleRad, born: now, life, size: 36, hue: 45 });
  spawnParticle({ kind: 'stickFlash', x: tip.x, y: tip.y, vx: 0, vy: 0, angle: angleRad, born: now, life: life * 0.72, size: 22, hue: 45 });
  spawnParticle({ kind: 'ring', x: tip.x, y: tip.y, vx: 0, vy: 0, angle: angleRad, born: now, life: life * 0.82, size: 30, hue: 45 });
  spawnParticle({ kind: 'stickRing', x: tip.x, y: tip.y, vx: 0, vy: 0, angle: angleRad, born: now, life: life * 0.78, size: 20, hue: 45 });
  spawnParticle({ kind: 'crack', x: tip.x, y: tip.y, vx: 0, vy: 0, angle: angleRad, born: now, life: life * 0.8, size: 36, hue: 45 });

  const chipDirs = [
    { vx: 36, vy: -28, a: 0.5 },
    { vx: -32, vy: -20, a: -0.4 },
    { vx: 12, vy: -44, a: 0.25 },
    { vx: 20, vy: 32, a: -0.2 },
  ];
  for (const d of chipDirs) {
    spawnParticle({
      kind: 'chip',
      x: tip.x,
      y: tip.y,
      vx: d.vx,
      vy: d.vy,
      angle: d.a,
      born: now,
      life: life * 0.9,
      size: 7,
      hue: 45,
    });
  }
}

export function prewarmAvatarStrikeCanvas() {
  loadArrowImage();
  while (particles.length < Math.min(256, AVATAR_STRIKE_MAX_PARTICLES)) {
    particles.push({
      active: false,
      kind: 'flash',
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      angle: 0,
      born: 0,
      life: 0,
      size: 0,
      hue: 45,
    });
  }
}
