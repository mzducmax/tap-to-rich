/**
 * Shared canvas compositor — 1 clear + N drawImage per frame (key 11 / [O]).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { isGameplayPaused } from '../../../gameplay/logic/gameplayPause';
import {
  registerAvatarMotionTick,
  unregisterAvatarMotionTick,
} from '../../key-3/logic/avatarMotionTicker';
import {
  BUTTERFLY_BURST_MS,
  BUTTERFLY_SIZE,
  GOLD_NUGGET_GRAVITY,
  GOLD_NUGGET_RENDER_DPR,
  GOLD_NUGGET_TOSS_TIME_MS,
} from '../config/butterflyConfig';
import { buildTossLaunch, type Pt } from './goldNuggetFlight';
import {
  clearGoldNuggetHitEffects,
  drawGoldNuggetHitEffects,
  hasActiveGoldNuggetHitEffects,
  spawnGoldNuggetHitEffect,
  tickGoldNuggetHitEffects,
} from './goldNuggetHitFx';
import { getGoldNuggetSprite, prewarmGoldNuggetSprite } from './goldNuggetSprite';

type HouseTargetFn = () => Pt;

type ActiveNugget = {
  id: number;
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  vx: number;
  vy: number;
  gravity: number;
  lastTick: number;
  rotation: number;
  spin: number;
  alpha: number;
  phase: 'air' | 'burst';
  impactAt: number;
  rewarded: boolean;
  getHouse: HouseTargetFn;
  onReward?: () => void;
  resolve: () => void;
};

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let cssW = 0;
let cssH = 0;
let dpr = 1;

const activeNuggets = new Map<number, ActiveNugget>();
let tickRegistered = false;
let fxNow = 0;

function isBusy(now: number) {
  return activeNuggets.size > 0 || hasActiveGoldNuggetHitEffects(now);
}

function syncTicker(now = performance.now()) {
  const busy = isBusy(now);
  if (busy && !tickRegistered) {
    registerAvatarMotionTick(tickFrame);
    tickRegistered = true;
  } else if (!busy && tickRegistered) {
    unregisterAvatarMotionTick(tickFrame);
    tickRegistered = false;
  }
}

function finishNugget(id: number) {
  const nugget = activeNuggets.get(id);
  if (!nugget) return;
  const { resolve } = nugget;
  activeNuggets.delete(id);
  resolve();
  syncTicker(fxNow);
  renderFrame(fxNow);
}

function impactNugget(id: number, nugget: ActiveNugget, now: number) {
  const house = nugget.getHouse();
  nugget.x = house.x;
  nugget.y = house.y;
  nugget.phase = 'burst';
  nugget.impactAt = now;
  spawnGoldNuggetHitEffect(house.x, house.y, id * 9973 + 41);
  if (!nugget.rewarded) {
    nugget.rewarded = true;
    nugget.onReward?.();
  }
}

function shouldImpact(nugget: ActiveNugget): boolean {
  const house = nugget.getHouse();
  const descending = nugget.vy > 0;
  const nearY = nugget.y >= house.y - 8;
  const nearX = Math.abs(nugget.x - house.x) <= 72;
  return descending && nearY && nearX;
}

function renderFrame(now: number) {
  if (!ctx) return;
  const sprite = getGoldNuggetSprite();

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);

  if (sprite) {
    const half = BUTTERFLY_SIZE * 0.5;
    for (const nugget of activeNuggets.values()) {
      if (nugget.phase === 'burst') continue;
      ctx.save();
      ctx.globalAlpha = nugget.alpha;
      ctx.translate(nugget.x, nugget.y);
      ctx.rotate(nugget.rotation);
      ctx.drawImage(sprite, -half, -half, BUTTERFLY_SIZE, BUTTERFLY_SIZE);
      ctx.restore();
    }
  }

  drawGoldNuggetHitEffects(ctx, now);
}

function tickFrame(now: number) {
  fxNow = now;
  if (!ctx) return;

  const paused = isGameplayPaused();

  if (!paused) {
    for (const [id, nugget] of [...activeNuggets.entries()]) {
      const dt = Math.min((now - nugget.lastTick) / 1000, 0.033);
      nugget.lastTick = now;

      if (nugget.phase === 'air') {
        nugget.vy += nugget.gravity * dt;
        nugget.x += nugget.vx * dt;
        nugget.y += nugget.vy * dt;

        const dx = nugget.x - nugget.prevX;
        const dy = nugget.y - nugget.prevY;
        nugget.rotation += (Math.hypot(dx, dy) * 0.022 + nugget.spin) * dt;
        nugget.prevX = nugget.x;
        nugget.prevY = nugget.y;

        if (shouldImpact(nugget)) {
          impactNugget(id, nugget, now);
        } else {
          const house = nugget.getHouse();
          const pastHouse =
            nugget.vy > 0 &&
            nugget.y > house.y + 24 &&
            Math.abs(nugget.x - house.x) < 140;
          if (pastHouse) {
            impactNugget(id, nugget, now);
          }
        }
      }

      if (nugget.phase === 'burst' && now - nugget.impactAt >= BUTTERFLY_BURST_MS) {
        finishNugget(id);
      }
    }

    tickGoldNuggetHitEffects(now, 0.016);
  } else {
    for (const nugget of activeNuggets.values()) {
      nugget.lastTick = now;
    }
  }

  renderFrame(now);
  syncTicker(now);
}

export function mountGoldNuggetCanvas(el: HTMLCanvasElement) {
  canvas = el;
  ctx = el.getContext('2d');
  prewarmGoldNuggetSprite();
}

export function unmountGoldNuggetCanvas() {
  for (const id of [...activeNuggets.keys()]) {
    finishNugget(id);
  }
  clearGoldNuggetHitEffects();
  canvas = null;
  ctx = null;
}

export function resizeGoldNuggetCanvas(width: number, height: number) {
  if (!canvas || !ctx || width <= 0 || height <= 0) return;

  cssW = width;
  cssH = height;
  dpr = Math.min(window.devicePixelRatio || 1, GOLD_NUGGET_RENDER_DPR);

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  renderFrame(fxNow || performance.now());
}

export function isGoldNuggetCanvasReady() {
  return Boolean(ctx);
}

export function isGoldNuggetCanvasSized() {
  return cssW > 0 && cssH > 0;
}

export type GoldNuggetSpawnOpts = {
  id: number;
  layerW: number;
  layerH: number;
  getHouseTarget: HouseTargetFn;
  onReward?: () => void;
};

export function spawnGoldNugget(opts: GoldNuggetSpawnOpts): Promise<void> {
  return new Promise((resolve) => {
    const house = opts.getHouseTarget();
    const launch = buildTossLaunch(
      opts.id,
      opts.layerW,
      opts.layerH,
      house,
      GOLD_NUGGET_GRAVITY,
      GOLD_NUGGET_TOSS_TIME_MS,
    );

    activeNuggets.set(opts.id, {
      id: opts.id,
      x: launch.x,
      y: launch.y,
      prevX: launch.x,
      prevY: launch.y,
      vx: launch.vx,
      vy: launch.vy,
      gravity: launch.gravity,
      lastTick: performance.now(),
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() * 2 - 1) * 5,
      alpha: 1,
      phase: 'air',
      impactAt: 0,
      rewarded: false,
      getHouse: opts.getHouseTarget,
      onReward: opts.onReward,
      resolve,
    });

    syncTicker();
    renderFrame(fxNow || performance.now());
  });
}

export function cancelGoldNugget(id: number) {
  const nugget = activeNuggets.get(id);
  if (!nugget) return;
  finishNugget(id);
}
