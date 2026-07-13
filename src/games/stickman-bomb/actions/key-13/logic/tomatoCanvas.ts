/**
 * Shared canvas compositor — 1 clear + N drawImage per frame (key 13 / [U]).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { audioManager } from '../../../../../utils/audio';
import { isGameplayPaused } from '../../../gameplay/logic/gameplayPause';
import {
  registerAvatarMotionTick,
  unregisterAvatarMotionTick,
} from '../../key-3/logic/avatarMotionTicker';
import { buildTossLaunch, type Pt } from '../../key-11/logic/goldNuggetFlight';
import {
  TOMATO_BURST_MS,
  TOMATO_GRAVITY,
  TOMATO_RENDER_DPR,
  TOMATO_SIZE,
  TOMATO_TOSS_TIME_MS,
} from '../config/tomatoConfig';
import {
  clearTomatoHitEffects,
  drawTomatoHitEffects,
  hasActiveTomatoHitEffects,
  spawnTomatoHitEffect,
  tickTomatoHitEffects,
} from './tomatoHitFx';
import {
  getVeggieSprite,
  prewarmTomatoSprite,
  VEGGIE_VARIANTS,
  type VeggieVariant,
} from './tomatoSprite';

type HouseTargetFn = () => Pt;

type ActiveTomato = {
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
  variant: VeggieVariant;
  impactAt: number;
  charged: boolean;
  getHouse: HouseTargetFn;
  onImpact?: () => void;
  resolve: () => void;
};

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let cssW = 0;
let cssH = 0;
let dpr = 1;

const activeTomatoes = new Map<number, ActiveTomato>();
let tickRegistered = false;
let fxNow = 0;

function isBusy(now: number) {
  return activeTomatoes.size > 0 || hasActiveTomatoHitEffects(now);
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

function finishTomato(id: number) {
  const tomato = activeTomatoes.get(id);
  if (!tomato) return;
  const { resolve } = tomato;
  activeTomatoes.delete(id);
  resolve();
  syncTicker(fxNow);
  renderFrame(fxNow);
}

function impactTomato(id: number, tomato: ActiveTomato, now: number) {
  const house = tomato.getHouse();
  tomato.x = house.x;
  tomato.y = house.y;
  tomato.phase = 'burst';
  tomato.impactAt = now;
  spawnTomatoHitEffect(house.x, house.y, id * 9973 + 41, tomato.variant);
  if (!tomato.charged) {
    tomato.charged = true;
    tomato.onImpact?.();
  }
}

function shouldImpact(tomato: ActiveTomato): boolean {
  const house = tomato.getHouse();
  const descending = tomato.vy > 0;
  const nearY = tomato.y >= house.y - 8;
  const nearX = Math.abs(tomato.x - house.x) <= 72;
  return descending && nearY && nearX;
}

function renderFrame(now: number) {
  if (!ctx) return;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);

  const half = TOMATO_SIZE * 0.5;
  for (const tomato of activeTomatoes.values()) {
    if (tomato.phase === 'burst') continue;
    const sprite = getVeggieSprite(tomato.variant);
    if (!sprite) continue;
    ctx.save();
    ctx.globalAlpha = tomato.alpha;
    ctx.translate(tomato.x, tomato.y);
    ctx.rotate(tomato.rotation);
    ctx.drawImage(sprite, -half, -half, TOMATO_SIZE, TOMATO_SIZE);
    ctx.restore();
  }

  drawTomatoHitEffects(ctx, now);
}

function tickFrame(now: number) {
  fxNow = now;
  if (!ctx) return;

  const paused = isGameplayPaused();

  if (!paused) {
    for (const [id, tomato] of [...activeTomatoes.entries()]) {
      const dt = Math.min((now - tomato.lastTick) / 1000, 0.033);
      tomato.lastTick = now;

      if (tomato.phase === 'air') {
        tomato.vy += tomato.gravity * dt;
        tomato.x += tomato.vx * dt;
        tomato.y += tomato.vy * dt;

        const dx = tomato.x - tomato.prevX;
        const dy = tomato.y - tomato.prevY;
        tomato.rotation += (Math.hypot(dx, dy) * 0.022 + tomato.spin) * dt;
        tomato.prevX = tomato.x;
        tomato.prevY = tomato.y;

        if (shouldImpact(tomato)) {
          impactTomato(id, tomato, now);
        } else {
          const house = tomato.getHouse();
          const pastHouse =
            tomato.vy > 0 &&
            tomato.y > house.y + 24 &&
            Math.abs(tomato.x - house.x) < 140;
          if (pastHouse) {
            impactTomato(id, tomato, now);
          }
        }
      }

      if (tomato.phase === 'burst' && now - tomato.impactAt >= TOMATO_BURST_MS) {
        finishTomato(id);
      }
    }

    tickTomatoHitEffects(now, 0.016);
  } else {
    for (const tomato of activeTomatoes.values()) {
      tomato.lastTick = now;
    }
  }

  renderFrame(now);
  syncTicker(now);
}

export function mountTomatoCanvas(el: HTMLCanvasElement) {
  canvas = el;
  ctx = el.getContext('2d');
  prewarmTomatoSprite();
}

export function unmountTomatoCanvas() {
  for (const id of [...activeTomatoes.keys()]) {
    finishTomato(id);
  }
  clearTomatoHitEffects();
  canvas = null;
  ctx = null;
}

export function resizeTomatoCanvas(width: number, height: number) {
  if (!canvas || !ctx || width <= 0 || height <= 0) return;

  cssW = width;
  cssH = height;
  dpr = Math.min(window.devicePixelRatio || 1, TOMATO_RENDER_DPR);

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  renderFrame(fxNow || performance.now());
}

export function isTomatoCanvasReady() {
  return Boolean(ctx);
}

export function isTomatoCanvasSized() {
  return cssW > 0 && cssH > 0;
}

export type TomatoSpawnOpts = {
  id: number;
  layerW: number;
  layerH: number;
  getHouseTarget: HouseTargetFn;
  onImpact?: () => void;
};

export function spawnTomato(opts: TomatoSpawnOpts): Promise<void> {
  return new Promise((resolve) => {
    const house = opts.getHouseTarget();
    const launch = buildTossLaunch(
      opts.id,
      opts.layerW,
      opts.layerH,
      house,
      TOMATO_GRAVITY,
      TOMATO_TOSS_TIME_MS,
    );

    activeTomatoes.set(opts.id, {
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
      variant: VEGGIE_VARIANTS[Math.floor(Math.random() * VEGGIE_VARIANTS.length)]!,
      impactAt: 0,
      charged: false,
      getHouse: opts.getHouseTarget,
      onImpact: opts.onImpact,
      resolve,
    });

    audioManager.playTomato();

    syncTicker();
    renderFrame(fxNow || performance.now());
  });
}

export function cancelTomato(id: number) {
  const tomato = activeTomatoes.get(id);
  if (!tomato) return;
  finishTomato(id);
}
