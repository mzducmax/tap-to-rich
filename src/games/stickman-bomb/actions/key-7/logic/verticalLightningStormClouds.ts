/**
 * Storm clouds — image-based parallax scroll (key 7).
 * Uses a storm-cloud PNG cutout — scattered sprites with random Y, scale, and parallax speed.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import stormCloudUrl from '../assets/storm-cloud.png';
import { VERTICAL_LIGHTNING_STORM_CLOUD_DPR } from '../config/verticalLightningConfig';
import { isGameplayPaused } from '../../../gameplay/logic/gameplayPause';
import {
  registerAvatarMotionTick,
  unregisterAvatarMotionTick,
} from '../../key-3/logic/avatarMotionTicker';

// ---------------------------------------------------------------------------
// Parallax cloud layer config
// ---------------------------------------------------------------------------

type CloudDepth = 'far' | 'mid' | 'near';

/** One drifting cloud sprite with depth, bobbing, and soft layering */
type CloudSprite = {
  x: number;
  baseY: number;
  drawW: number;
  drawH: number;
  speed: number;
  alpha: number;
  depth: CloudDepth;
  phase: number;
  bobAmp: number;
  rot: number;
  scalePulse: number;
};

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let cloudImg: HTMLImageElement | null = null;
let imgReady = false;
let logicalWidth = 0;
let logicalHeight = 0;
let bufferDpr = 1;
let sprites: CloudSprite[] = [];
let spritesSortedByDepth: CloudSprite[] = []; // sorted once, reused every frame
let skyGradient: CanvasGradient | null = null;
let skyGradientSkyH = 0;
let hazeGradient: CanvasGradient | null = null;
let hazeGradientWidth = 0;
let lastTickMs = 0;
let tickRegistered = false;
let animating = false;

// ---------------------------------------------------------------------------
// Image load (singleton)
// ---------------------------------------------------------------------------

function ensureImageLoaded(): void {
  if (cloudImg) return;
  const img = new Image();
  img.onload = () => {
    imgReady = true;
    // Rebuild layers now that we know the natural image size
    if (logicalWidth > 0 && logicalHeight > 0) {
      sprites = buildSprites(logicalWidth, logicalHeight);
      spritesSortedByDepth = [...sprites].sort(
        (a, b) => DEPTH_TUNING[a.depth].scaleMin - DEPTH_TUNING[b.depth].scaleMin,
      );
    }
  };
  img.src = stormCloudUrl as string;
  cloudImg = img;
}

// ---------------------------------------------------------------------------
// Sprite spawn
// ---------------------------------------------------------------------------

const DEPTH_TUNING: Record<
  CloudDepth,
  { scaleMin: number; scaleMax: number; speedMin: number; speedMax: number; alphaMin: number; alphaMax: number }
> = {
  far: { scaleMin: 0.30, scaleMax: 0.50, speedMin: 5, speedMax: 13, alphaMin: 0.24, alphaMax: 0.40 },
  mid: { scaleMin: 0.46, scaleMax: 0.68, speedMin: 11, speedMax: 21, alphaMin: 0.38, alphaMax: 0.56 },
  near: { scaleMin: 0.58, scaleMax: 0.86, speedMin: 17, speedMax: 30, alphaMin: 0.48, alphaMax: 0.70 },
};

function pickCloudDepth(): CloudDepth {
  const roll = Math.random();
  if (roll < 0.34) return 'far';
  if (roll < 0.72) return 'mid';
  return 'near';
}

function randomCloudY(height: number, drawH: number, depth: CloudDepth): number {
  const lift = depth === 'far' ? 0.04 : depth === 'mid' ? 0.01 : -0.02;
  const yMin = height * (-0.22 + lift);
  const yMax = height * (0.08 + lift);
  return yMin + Math.random() * (yMax - yMin + drawH * 0.06) - drawH * 0.05;
}

function spawnCloud(
  width: number,
  height: number,
  spawnX?: number,
  depthOverride?: CloudDepth,
): CloudSprite {
  const nat = { w: cloudImg!.naturalWidth || 800, h: cloudImg!.naturalHeight || 600 };
  const depth = depthOverride ?? pickCloudDepth();
  const tuning = DEPTH_TUNING[depth];
  const skyBand = height * 0.30;
  const scale = tuning.scaleMin + Math.random() * (tuning.scaleMax - tuning.scaleMin);
  const drawH = skyBand * scale;
  const drawW = (nat.w / nat.h) * drawH;
  const speed = tuning.speedMin + Math.random() * (tuning.speedMax - tuning.speedMin);
  const alpha = tuning.alphaMin + Math.random() * (tuning.alphaMax - tuning.alphaMin);
  const x = spawnX ?? Math.random() * (width + drawW) - drawW * 0.5;
  const baseY = randomCloudY(height, drawH, depth);

  return {
    x,
    baseY,
    drawW,
    drawH,
    speed,
    alpha,
    depth,
    phase: Math.random() * Math.PI * 2,
    bobAmp: 2 + Math.random() * (depth === 'near' ? 7 : 5),
    rot: (Math.random() - 0.5) * 0.12,
    scalePulse: 0.012 + Math.random() * 0.022,
  };
}

function buildSprites(width: number, height: number): CloudSprite[] {
  if (!cloudImg || !imgReady) return [];

  const count = Math.max(14, Math.ceil(width / 92));
  const result: CloudSprite[] = [];

  while (result.length < count) {
    const clusterSize = 1 + Math.floor(Math.random() * 3);
    const clusterX = Math.random() * (width + 260) - 80;
    const clusterDepth = pickCloudDepth();

    for (let i = 0; i < clusterSize && result.length < count; i += 1) {
      const offsetX = clusterX + i * (72 + Math.random() * 88) + (Math.random() - 0.5) * 36;
      result.push(spawnCloud(width, height, offsetX, clusterDepth));
    }
  }

  return result;
}

function recycleCloud(sprite: CloudSprite, width: number, height: number): void {
  const depth = pickCloudDepth();
  const next = spawnCloud(width, height, width + sprite.drawW * (0.2 + Math.random() * 0.75), depth);

  sprite.baseY = next.baseY;
  sprite.drawW = next.drawW;
  sprite.drawH = next.drawH;
  sprite.speed = next.speed;
  sprite.alpha = next.alpha;
  sprite.depth = next.depth;
  sprite.phase = next.phase;
  sprite.bobAmp = next.bobAmp;
  sprite.rot = next.rot;
  sprite.scalePulse = next.scalePulse;
  sprite.x = next.x;
}

// ---------------------------------------------------------------------------
// Sky gradient (cached — rebuilt only on resize)
// ---------------------------------------------------------------------------

function ensureSkyGradient(context: CanvasRenderingContext2D, height: number): CanvasGradient {
  const skyH = height * 0.42;
  if (skyGradient && skyGradientSkyH === skyH) return skyGradient;

  const gradient = context.createLinearGradient(0, 0, 0, skyH);
  gradient.addColorStop(0, 'rgba(2, 4, 12, 0.94)');
  gradient.addColorStop(0.16, 'rgba(6, 8, 20, 0.88)');
  gradient.addColorStop(0.34, 'rgba(10, 12, 28, 0.72)');
  gradient.addColorStop(0.56, 'rgba(14, 16, 34, 0.44)');
  gradient.addColorStop(0.78, 'rgba(16, 18, 38, 0.18)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  skyGradient = gradient;
  skyGradientSkyH = skyH;
  return gradient;
}

function ensureHazeGradient(context: CanvasRenderingContext2D, width: number): CanvasGradient {
  if (hazeGradient && hazeGradientWidth === width) return hazeGradient;
  const gradient = context.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.18)');
  gradient.addColorStop(0.18, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(0.82, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.16)');
  hazeGradient = gradient;
  hazeGradientWidth = width;
  return gradient;
}

function drawStormSky(context: CanvasRenderingContext2D, width: number, height: number) {
  context.fillStyle = ensureSkyGradient(context, height);
  context.fillRect(0, 0, width, skyGradientSkyH);

  // Soft horizontal vignette — gradient cached, not recreated every frame.
  context.fillStyle = ensureHazeGradient(context, width);
  context.fillRect(0, 0, width, skyGradientSkyH);
}

// ---------------------------------------------------------------------------
// Draw frame
// ---------------------------------------------------------------------------

function drawFrame(now: number) {
  if (!ctx || logicalWidth <= 0 || logicalHeight <= 0) return;

  const dt = lastTickMs > 0 ? Math.min(48, now - lastTickMs) : 16;
  lastTickMs = now;

  ctx.setTransform(bufferDpr, 0, 0, bufferDpr, 0, 0);
  ctx.clearRect(0, 0, logicalWidth, logicalHeight);

  drawStormSky(ctx, logicalWidth, logicalHeight);

  if (!cloudImg || !imgReady || sprites.length === 0) return;

  const t = now * 0.001;

  for (const sprite of spritesSortedByDepth) {
    const speedWave = 1 + Math.sin(t * 0.55 + sprite.phase) * 0.08;
    sprite.x -= (sprite.speed * speedWave * dt) / 1000;

    if (sprite.x + sprite.drawW < -sprite.drawW * 0.25) {
      recycleCloud(sprite, logicalWidth, logicalHeight);
    }

    const bob = Math.sin(t * (0.72 + sprite.scalePulse * 18) + sprite.phase) * sprite.bobAmp;
    const pulse = 1 + Math.sin(t * 1.05 + sprite.phase * 1.7) * sprite.scalePulse;
    const drawW = sprite.drawW * pulse;
    const drawH = sprite.drawH * pulse;
    const x = sprite.x;
    const y = sprite.baseY + bob;
    const cx = x + drawW * 0.5;
    const cy = y + drawH * 0.52;
    const tilt = sprite.rot + Math.sin(t * 0.28 + sprite.phase) * 0.018;

    // Wispy under-layer — softer alpha puff beneath each cloud (no ctx.filter blur; GPU-free).
    ctx.save();
    ctx.globalAlpha = sprite.alpha * 0.18;
    ctx.drawImage(cloudImg, x - drawW * 0.04, y + drawH * 0.1, drawW * 1.1, drawH * 0.88);
    ctx.restore();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(tilt);
    ctx.globalAlpha = sprite.alpha;
    ctx.drawImage(cloudImg, -drawW * 0.5, -drawH * 0.5, drawW, drawH);

    // Subtle cool tint on near clouds for storm depth
    if (sprite.depth === 'near') {
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = 'rgba(148, 168, 210, 0.08)';
      ctx.fillRect(-drawW * 0.5, -drawH * 0.5, drawW, drawH);
    }

    ctx.restore();
  }

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

// ---------------------------------------------------------------------------
// Tick
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Resize / mount
// ---------------------------------------------------------------------------

function resizeBuffer(width: number, height: number) {
  if (!canvas || !ctx || width <= 0 || height <= 0) return;

  logicalWidth = width;
  logicalHeight = height;
  bufferDpr = Math.min(window.devicePixelRatio || 1, VERTICAL_LIGHTNING_STORM_CLOUD_DPR);

  skyGradient = null;
  skyGradientSkyH = 0;

  canvas.width = Math.floor(width * bufferDpr);
  canvas.height = Math.floor(height * bufferDpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.setTransform(bufferDpr, 0, 0, bufferDpr, 0, 0);
  ctx.imageSmoothingEnabled = true;

  sprites = buildSprites(width, height);
  spritesSortedByDepth = [...sprites].sort(
    (a, b) => DEPTH_TUNING[a.depth].scaleMin - DEPTH_TUNING[b.depth].scaleMin,
  );
  drawFrame(performance.now());
}

export function mountStormCloudCanvas(target: HTMLCanvasElement): void {
  canvas = target;
  ctx = target.getContext('2d', { alpha: true, desynchronized: true });
  if (!ctx) return;
  ctx.imageSmoothingEnabled = true;
  ensureImageLoaded();
}

export function resizeStormCloudCanvas(width: number, height: number): void {
  resizeBuffer(width, height);
}

export function startStormCloudAnimation(): void {
  animating = true;
  syncTickRegistration();
}

export function stopStormCloudAnimation(): void {
  animating = false;
  syncTickRegistration();
}

export function unmountStormCloudCanvas(): void {
  stopStormCloudAnimation();
  if (ctx && logicalWidth > 0 && logicalHeight > 0) {
    ctx.clearRect(0, 0, logicalWidth, logicalHeight);
  }
  canvas = null;
  ctx = null;
  sprites = [];
  skyGradient = null;
  skyGradientSkyH = 0;
  logicalWidth = 0;
  logicalHeight = 0;
}
