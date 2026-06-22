/**
 * Decorative sky clouds — single canvas, atlas sprites, shared rAF ticker.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import skyCloudsUrl from '../assets/sky-clouds.png';
import {
  SKY_CLOUD_ATLAS_REGIONS,
  SKY_CLOUD_RENDER_DPR,
  SKY_CLOUD_SMALL_REGIONS,
  type SkyCloudAtlasRegion,
} from '../config/skyCloudConfig';
import { isGameplayPaused } from '../../gameplay/logic/gameplayPause';
import {
  registerAvatarMotionTick,
  unregisterAvatarMotionTick,
} from '../../actions/key-3/logic/avatarMotionTicker';
import type { ActiveThemeKey } from '../types';

type CloudSprite = {
  x: number;
  y: number;
  drawW: number;
  drawH: number;
  speed: number;
  alpha: number;
  region: SkyCloudAtlasRegion;
};

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let cloudImg: HTMLImageElement | null = null;
let imgReady = false;
let logicalWidth = 0;
let logicalHeight = 0;
let bufferDpr = 1;
let sprites: CloudSprite[] = [];
let activeTheme: ActiveThemeKey = 'day';
let lastTickMs = 0;
let tickRegistered = false;
let animating = false;

function themeAlphaBoost(theme: ActiveThemeKey): number {
  switch (theme) {
    case 'sunrise':
    case 'sunset':
      return 0.82;
    case 'meadow':
      return 0.94;
    default:
      return 0.88;
  }
}

function ensureImageLoaded(): void {
  if (cloudImg) return;
  const img = new Image();
  img.onload = () => {
    imgReady = true;
    if (logicalWidth > 0 && logicalHeight > 0) {
      sprites = buildSprites(logicalWidth, logicalHeight);
    }
  };
  img.src = skyCloudsUrl as string;
  cloudImg = img;
}

function pickRegion(): SkyCloudAtlasRegion {
  const pool =
    Math.random() < 0.82 && SKY_CLOUD_SMALL_REGIONS.length > 0
      ? SKY_CLOUD_SMALL_REGIONS
      : SKY_CLOUD_ATLAS_REGIONS;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Keep cloud sprites in the upper sky — avoids hard clip at layer bottom. */
function randomCloudY(height: number, drawH: number): number {
  const yMin = height * -0.14;
  const yMax = height * 0.16;
  const y = yMin + Math.random() * (yMax - yMin);
  const maxBottom = height * 0.34;
  return Math.min(y, maxBottom - drawH);
}

function spawnCloud(width: number, height: number, spawnX?: number): CloudSprite {
  const region = pickRegion();
  const skyBand = height * 0.26;
  const regionScale = Math.min(region.w, 320) / 320;
  const scale = (0.32 + Math.random() * 0.52) * (0.78 + regionScale * 0.22);
  const drawH = skyBand * scale;
  const drawW = (region.w / region.h) * drawH;
  const speed = 6 + (1.1 - Math.min(1, scale)) * 22 + Math.random() * 8;
  const alpha = (0.52 + Math.random() * 0.34) * themeAlphaBoost(activeTheme);
  const x = spawnX ?? Math.random() * (width + drawW) - drawW * 0.5;
  const y = randomCloudY(height, drawH);

  return { x, y, drawW, drawH, speed, alpha, region };
}

function buildSprites(width: number, height: number): CloudSprite[] {
  if (!cloudImg || !imgReady) return [];

  const count = Math.max(8, Math.min(14, Math.ceil(width / 95)));
  return Array.from({ length: count }, () => spawnCloud(width, height));
}

function recycleCloud(sprite: CloudSprite, width: number, height: number): void {
  const region = pickRegion();
  const skyBand = height * 0.26;
  const regionScale = Math.min(region.w, 320) / 320;
  const scale = (0.32 + Math.random() * 0.52) * (0.78 + regionScale * 0.22);
  const drawH = skyBand * scale;
  const drawW = (region.w / region.h) * drawH;

  sprite.region = region;
  sprite.drawW = drawW;
  sprite.drawH = drawH;
  sprite.speed = 6 + (1.1 - Math.min(1, scale)) * 22 + Math.random() * 8;
  sprite.alpha = (0.52 + Math.random() * 0.34) * themeAlphaBoost(activeTheme);
  sprite.x = width + drawW * (0.12 + Math.random() * 0.88);
  sprite.y = randomCloudY(height, drawH);
}

function drawFrame(now: number) {
  if (!ctx || logicalWidth <= 0 || logicalHeight <= 0) return;

  const dt = lastTickMs > 0 ? Math.min(48, now - lastTickMs) : 16;
  lastTickMs = now;

  ctx.setTransform(bufferDpr, 0, 0, bufferDpr, 0, 0);
  ctx.clearRect(0, 0, logicalWidth, logicalHeight);

  if (!cloudImg || !imgReady || sprites.length === 0) return;

  const drawOrder = [...sprites].sort(
    (a, b) => b.drawW * b.drawH - a.drawW * a.drawH,
  );

  for (const sprite of drawOrder) {
    sprite.x -= (sprite.speed * dt) / 1000;

    if (sprite.x + sprite.drawW < -sprite.drawW * 0.2) {
      recycleCloud(sprite, logicalWidth, logicalHeight);
    }

    const { region } = sprite;
    ctx.globalAlpha = sprite.alpha;
    ctx.drawImage(
      cloudImg,
      region.x,
      region.y,
      region.w,
      region.h,
      sprite.x,
      sprite.y,
      sprite.drawW,
      sprite.drawH,
    );
  }

  ctx.globalAlpha = 1;
}

function syncTick(now: number) {
  if (!animating || isGameplayPaused()) return;
  drawFrame(now);
}

function syncTickRegistration() {
  if (animating && !tickRegistered) {
    registerAvatarMotionTick(syncTick);
    tickRegistered = true;
    lastTickMs = 0;
    syncTick(performance.now());
    return;
  }
  if (!animating && tickRegistered) {
    unregisterAvatarMotionTick(syncTick);
    tickRegistered = false;
    lastTickMs = 0;
  }
}

function resizeBuffer(width: number, height: number) {
  if (!canvas || !ctx || width <= 0 || height <= 0) return;

  logicalWidth = width;
  logicalHeight = height;
  bufferDpr = Math.min(window.devicePixelRatio || 1, SKY_CLOUD_RENDER_DPR);

  canvas.width = Math.floor(width * bufferDpr);
  canvas.height = Math.floor(height * bufferDpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.setTransform(bufferDpr, 0, 0, bufferDpr, 0, 0);
  ctx.imageSmoothingEnabled = true;

  sprites = buildSprites(width, height);
  drawFrame(performance.now());
}

export function setSkyCloudTheme(theme: ActiveThemeKey): void {
  if (activeTheme === theme) return;
  activeTheme = theme;
  if (logicalWidth > 0 && logicalHeight > 0 && imgReady) {
    sprites = buildSprites(logicalWidth, logicalHeight);
  }
  drawFrame(performance.now());
}

export function mountSkyCloudCanvas(target: HTMLCanvasElement): void {
  canvas = target;
  ctx = target.getContext('2d', { alpha: true, desynchronized: true });
  if (!ctx) return;
  ctx.imageSmoothingEnabled = true;
  ensureImageLoaded();
}

export function resizeSkyCloudCanvas(width: number, height: number): void {
  resizeBuffer(width, height);
}

export function startSkyCloudAnimation(): void {
  animating = true;
  syncTickRegistration();
}

export function stopSkyCloudAnimation(): void {
  animating = false;
  syncTickRegistration();
}

export function unmountSkyCloudCanvas(): void {
  stopSkyCloudAnimation();
  if (ctx && logicalWidth > 0 && logicalHeight > 0) {
    ctx.clearRect(0, 0, logicalWidth, logicalHeight);
  }
  canvas = null;
  ctx = null;
  sprites = [];
  logicalWidth = 0;
  logicalHeight = 0;
  activeTheme = 'day';
}
