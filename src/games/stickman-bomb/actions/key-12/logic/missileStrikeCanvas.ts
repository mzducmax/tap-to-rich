/**
 * PixiJS compositor — every missile + explosion painted onto one offscreen
 * Canvas2D, uploaded as a single texture / 1 draw call. Scales to many spawns
 * because adding a missile is just one more entry in the shared draw loop.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { Application, Sprite, Texture } from 'pixi.js';
import { isGameplayPaused } from '../../../gameplay/logic/gameplayPause';
import {
  registerAvatarMotionTick,
  unregisterAvatarMotionTick,
} from '../../key-3/logic/avatarMotionTicker';
import {
  MISSILE_MAX_ACTIVE,
  MISSILE_RENDER_DPR,
} from '../config/missileStrikeConfig';
import {
  drawMissileFrame,
  missileProgressRaw,
  type MissileDrawState,
} from './missileStrikeDraw';

export type MissileSpawn = {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  c1x: number;
  c1y: number;
  c2x: number;
  c2y: number;
  seed: number;
  flightMs: number;
  explodeMs: number;
  onImpact?: () => void;
};

type ActiveMissile = MissileDrawState & {
  onImpact?: () => void;
  resolve: () => void;
};

let app: Application | null = null;
let displaySprite: Sprite | null = null;
let layerTexture: Texture | null = null;
let offscreenCanvas: HTMLCanvasElement | null = null;
let offscreenCtx: CanvasRenderingContext2D | null = null;
let logicalWidth = 0;
let logicalHeight = 0;
let bufferDpr = 1;
let ready = false;
let mountPromise: Promise<void> | null = null;

const activeMissiles: ActiveMissile[] = [];
let nextMissileId = 1;
let tickRegistered = false;

function computeBufferDpr(): number {
  return Math.min(window.devicePixelRatio || 1, MISSILE_RENDER_DPR);
}

function resizeOffscreenBuffer(width: number, height: number) {
  if (!offscreenCanvas || !displaySprite || !app || !layerTexture) return;
  if (width <= 0 || height <= 0) return;

  logicalWidth = width;
  logicalHeight = height;
  bufferDpr = computeBufferDpr();

  layerTexture.source.resize(width, height, bufferDpr);

  displaySprite.width = width;
  displaySprite.height = height;
  app.renderer.resize(width, height);
}

function uploadOffscreenTexture() {
  if (!layerTexture) return;
  layerTexture.source.update();
}

function renderFrame(now: number) {
  if (!ready || !offscreenCtx || !app || logicalWidth <= 0 || logicalHeight <= 0) return;

  const struckIndices = drawMissileFrame(
    offscreenCtx,
    logicalWidth,
    logicalHeight,
    bufferDpr,
    activeMissiles,
    now,
  );

  for (const idx of struckIndices) {
    const missile = activeMissiles[idx];
    if (!missile || missile.struck) continue;
    missile.struck = true;
    missile.onImpact?.();
  }

  for (let i = activeMissiles.length - 1; i >= 0; i--) {
    const missile = activeMissiles[i]!;
    if (missileProgressRaw(missile, now) < 1) continue;
    missile.resolve();
    activeMissiles.splice(i, 1);
  }

  uploadOffscreenTexture();
  app.render();
}

function syncPixiTicker(now: number) {
  if (!ready) return;
  if (isGameplayPaused()) return;
  if (activeMissiles.length === 0) return;
  renderFrame(now);
  syncTickerRegistration();
}

function syncTickerRegistration() {
  const busy = activeMissiles.length > 0;
  if (ready && busy && !tickRegistered) {
    registerAvatarMotionTick(syncPixiTicker);
    tickRegistered = true;
    return;
  }
  if (!busy && tickRegistered) {
    unregisterAvatarMotionTick(syncPixiTicker);
    tickRegistered = false;
  }
}

export function isMissileCanvasReady(): boolean {
  return ready;
}

export function isMissileCanvasSized(): boolean {
  return logicalWidth > 0 && logicalHeight > 0;
}

export function mountMissileCanvas(
  visibleCanvas: HTMLCanvasElement,
  width = 0,
  height = 0,
): Promise<void> {
  if (ready && app) {
    if (width > 0 && height > 0) resizeOffscreenBuffer(width, height);
    return Promise.resolve();
  }
  if (mountPromise) return mountPromise;

  mountPromise = (async () => {
    const application = new Application();
    await application.init({
      canvas: visibleCanvas,
      backgroundAlpha: 0,
      antialias: false,
      resolution: 1,
      autoDensity: true,
      preference: 'webgl',
    });

    application.ticker.stop();

    offscreenCanvas = document.createElement('canvas');
    offscreenCtx = offscreenCanvas.getContext('2d', { alpha: true });
    if (!offscreenCtx) {
      application.destroy(true);
      mountPromise = null;
      throw new Error('missile-strike: offscreen 2d context unavailable');
    }

    layerTexture = Texture.from(offscreenCanvas);
    displaySprite = new Sprite(layerTexture);
    application.stage.addChild(displaySprite);

    app = application;
    ready = true;

    if (width > 0 && height > 0) {
      resizeOffscreenBuffer(width, height);
    }
  })();

  return mountPromise;
}

export function resizeMissileCanvas(width: number, height: number): void {
  if (!ready || width <= 0 || height <= 0) return;
  resizeOffscreenBuffer(width, height);
}

export function unmountMissileCanvas(): void {
  unregisterAvatarMotionTick(syncPixiTicker);
  tickRegistered = false;

  for (const missile of activeMissiles) {
    missile.resolve();
  }
  activeMissiles.length = 0;

  displaySprite?.destroy();
  displaySprite = null;
  layerTexture?.destroy(true);
  layerTexture = null;
  offscreenCanvas = null;
  offscreenCtx = null;
  app?.destroy(true, { children: true, texture: true });
  app = null;
  ready = false;
  mountPromise = null;
  logicalWidth = 0;
  logicalHeight = 0;
}

export function cancelAllMissiles(): void {
  for (const missile of activeMissiles) {
    missile.resolve();
  }
  activeMissiles.length = 0;
  if (offscreenCtx && logicalWidth > 0 && logicalHeight > 0) {
    offscreenCtx.setTransform(bufferDpr, 0, 0, bufferDpr, 0, 0);
    offscreenCtx.clearRect(0, 0, logicalWidth, logicalHeight);
    uploadOffscreenTexture();
    app?.render();
  }
  syncTickerRegistration();
}

export function spawnMissile(spec: MissileSpawn): Promise<void> {
  if (!ready || !offscreenCtx || logicalWidth <= 0 || logicalHeight <= 0) {
    return Promise.resolve();
  }
  if (activeMissiles.length >= MISSILE_MAX_ACTIVE) {
    return Promise.resolve();
  }

  const id = nextMissileId++;

  return new Promise((resolve) => {
    const startTime = performance.now();
    activeMissiles.push({
      id,
      startX: spec.startX,
      startY: spec.startY,
      targetX: spec.targetX,
      targetY: spec.targetY,
      c1x: spec.c1x,
      c1y: spec.c1y,
      c2x: spec.c2x,
      c2y: spec.c2y,
      seed: spec.seed,
      startTime,
      flightDuration: spec.flightMs,
      explodeDuration: spec.explodeMs,
      struck: false,
      smoke: [],
      lastSmokeAt: 0,
      onImpact: spec.onImpact,
      resolve,
    });
    syncTickerRegistration();
    syncPixiTicker(startTime);
  });
}
