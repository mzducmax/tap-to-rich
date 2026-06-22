/**
 * PixiJS compositor — 1 sprite / 1 draw call; offscreen Canvas2D keeps exact visuals.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { Application, Sprite, Texture } from 'pixi.js';
import { isGameplayPaused } from '../../../gameplay/logic/gameplayPause';
import {
  registerAvatarMotionTick,
  unregisterAvatarMotionTick,
} from '../../key-3/logic/avatarMotionTicker';
import {
  VERTICAL_LIGHTNING_MAX_ACTIVE_BOLTS,
  VERTICAL_LIGHTNING_RENDER_DPR,
} from '../config/verticalLightningConfig';
import {
  boltAnimationRaw,
  drawVerticalLightningFrame,
  type VerticalBoltDrawState,
} from './verticalLightningDraw';
import { generateVerticalBoltGeometry } from './verticalLightningPath';

export type VerticalBoltSpawn = {
  cloudX: number;
  tipX: number;
  tipY: number;
  durationMs: number;
  onStrike?: () => void;
};

type ActiveBolt = VerticalBoltDrawState & {
  id: number;
  onStrike?: () => void;
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

const activeBolts: ActiveBolt[] = [];
let nextBoltId = 1;
let tickRegistered = false;

function computeBufferDpr(): number {
  return Math.min(window.devicePixelRatio || 1, VERTICAL_LIGHTNING_RENDER_DPR);
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

  const strikeIndices = drawVerticalLightningFrame(
    offscreenCtx,
    logicalWidth,
    logicalHeight,
    bufferDpr,
    activeBolts,
    now,
  );

  for (const idx of strikeIndices) {
    const bolt = activeBolts[idx];
    if (!bolt || bolt.struck) continue;
    bolt.struck = true;
    bolt.onStrike?.();
  }

  for (let i = activeBolts.length - 1; i >= 0; i--) {
    const bolt = activeBolts[i]!;
    if (boltAnimationRaw(bolt, now) < 1) continue;
    bolt.resolve();
    activeBolts.splice(i, 1);
  }

  uploadOffscreenTexture();
  app.render();
}

function syncPixiTicker(now: number) {
  if (!ready) return;
  if (isGameplayPaused()) return;
  if (activeBolts.length === 0) return;
  renderFrame(now);
  syncTickerRegistration();
}

function syncTickerRegistration() {
  const busy = activeBolts.length > 0;
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

export function isVerticalLightningCanvasReady(): boolean {
  return ready;
}

export function isVerticalLightningCanvasSized(): boolean {
  return logicalWidth > 0 && logicalHeight > 0;
}

export function mountVerticalLightningCanvas(
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
      throw new Error('vertical-lightning: offscreen 2d context unavailable');
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

export function resizeVerticalLightningCanvas(width: number, height: number): void {
  if (!ready || width <= 0 || height <= 0) return;
  resizeOffscreenBuffer(width, height);
}

export function unmountVerticalLightningCanvas(): void {
  unregisterAvatarMotionTick(syncPixiTicker);
  tickRegistered = false;

  for (const bolt of activeBolts) {
    bolt.resolve();
  }
  activeBolts.length = 0;

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

export function cancelAllVerticalBolts(): void {
  for (const bolt of activeBolts) {
    bolt.resolve();
  }
  activeBolts.length = 0;
  if (offscreenCtx && logicalWidth > 0 && logicalHeight > 0) {
    offscreenCtx.setTransform(bufferDpr, 0, 0, bufferDpr, 0, 0);
    offscreenCtx.clearRect(0, 0, logicalWidth, logicalHeight);
    uploadOffscreenTexture();
    app?.render();
  }
  syncTickerRegistration();
}

export function spawnVerticalBolt(spec: VerticalBoltSpawn): Promise<void> {
  if (!ready || !offscreenCtx || logicalWidth <= 0 || logicalHeight <= 0) {
    return Promise.resolve();
  }
  if (activeBolts.length >= VERTICAL_LIGHTNING_MAX_ACTIVE_BOLTS) {
    return Promise.resolve();
  }

  const startY = 4;
  const geometry = generateVerticalBoltGeometry(spec.cloudX, startY, spec.tipX, spec.tipY);
  const id = nextBoltId++;

  return new Promise((resolve) => {
    const startTime = performance.now();
    activeBolts.push({
      id,
      geometry,
      tipX: spec.tipX,
      tipY: spec.tipY,
      cloudX: spec.cloudX,
      startY,
      startTime,
      duration: spec.durationMs,
      seed: Math.random() * 4,
      struck: false,
      onStrike: spec.onStrike,
      resolve,
    });
    syncTickerRegistration();
    syncPixiTicker(startTime);
  });
}
