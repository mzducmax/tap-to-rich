/**
 * PixiJS compositor — pig bank descends + reward label (key P).
 * The money downpour itself is a transparent WebM played as a DOM overlay
 * (see PigBankLayer); this layer only animates the pig and the +$ label.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { Application, Particle, ParticleContainer, Sprite, Texture } from 'pixi.js';
import { isGameplayPaused } from '../../../gameplay/logic/gameplayPause';
import {
  registerAvatarMotionTick,
  unregisterAvatarMotionTick,
} from '../../key-3/logic/avatarMotionTicker';
import { pigUrl, moneyStackUrl } from '../config/pigBankAssets';
import {
  MONEY_RAIN_AREA_PER_BILL,
  MONEY_RAIN_BILL_MAX_W,
  MONEY_RAIN_BILL_MIN_W,
  MONEY_RAIN_FALL_MAX,
  MONEY_RAIN_FALL_MIN,
  MONEY_RAIN_MAX_COUNT,
  MONEY_RAIN_MIN_COUNT,
  MONEY_RAIN_SPIN_MAX,
  MONEY_RAIN_SWAY_MAX,
  MONEY_RAIN_SWAY_MIN,
  MONEY_VIDEO_FILL_MS,
  PIG_BANK_FADE_MS,
  PIG_BANK_RENDER_DPR,
  PIG_BANK_REWARD_HOLD_MS,
  PIG_BANK_BG_KEY_THRESHOLD,
  PIG_DESCEND_MS,
} from '../config/pigBankConfig';
import { computePigSpriteDrawSize, drawPigBankFrame, type PigDrawState } from './pigBankDraw';

export type PigBankSpawnSpec = {
  onReward?: () => void;
  onRainChange?: (raining: boolean) => void;
};

type ActiveSession = PigDrawState & {
  id: number;
  phase: 'descend' | 'rain' | 'reward' | 'fade' | 'done';
  phaseStart: number;
  rewardFired: boolean;
  rainAnnounced: boolean;
  onReward?: () => void;
  onRainChange?: (raining: boolean) => void;
  resolve: () => void;
};

let app: Application | null = null;
let displaySprite: Sprite | null = null;
let layerTexture: Texture | null = null;
let offscreenCanvas: HTMLCanvasElement | null = null;
let offscreenCtx: CanvasRenderingContext2D | null = null;
let pigImg: HTMLImageElement | null = null;
let imgReady = false;

// ---- GPU money downpour (single batched ParticleContainer) ----
type BillMeta = {
  vy: number; // fall speed (px/s)
  baseX: number; // sway centre
  swayAmp: number;
  swaySpeed: number;
  swayPhase: number;
  vr: number; // spin (rad/s)
};
let moneyLayer: ParticleContainer | null = null;
let moneyTexture: Texture | null = null;
let moneyTextureReady = false;
let moneyParticles: Particle[] = [];
let moneyMeta: BillMeta[] = [];
let moneyBaseScale = 1; // texture-px → 1px width
let lastRainTime = 0;
let rainAlpha = 0; // 0..1 global fade for the whole downpour

let logicalWidth = 0;
let logicalHeight = 0;
let bufferDpr = 1;
let ready = false;
let mountPromise: Promise<void> | null = null;

// Only re-upload the offscreen texture to the GPU when its content actually
// changed (the pig is static during the rain phase, so most frames skip it).
let canvasSig = '';
let canvasUploaded = false;

const activeSessions: ActiveSession[] = [];
let nextSessionId = 1;
let tickRegistered = false;

function computeBufferDpr(): number {
  return Math.min(window.devicePixelRatio || 1, PIG_BANK_RENDER_DPR);
}

function stripBlackBackground(source: HTMLImageElement): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const off = document.createElement('canvas');
    off.width = source.naturalWidth || source.width;
    off.height = source.naturalHeight || source.height;
    const octx = off.getContext('2d');
    if (!octx) {
      resolve(source);
      return;
    }

    octx.drawImage(source, 0, 0);
    const { data, width, height } = octx.getImageData(0, 0, off.width, off.height);
    const threshold = PIG_BANK_BG_KEY_THRESHOLD;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]!;
      const g = data[i + 1]!;
      const b = data[i + 2]!;
      if (r <= threshold && g <= threshold && b <= threshold) {
        data[i + 3] = 0;
      }
    }

    octx.putImageData(new ImageData(data, width, height), 0, 0);

    const processed = new Image();
    processed.decoding = 'async';
    processed.onload = () => resolve(processed);
    processed.onerror = () => resolve(source);
    processed.src = off.toDataURL('image/png');
  });
}

function loadImages() {
  if (pigImg) return;

  const raw = new Image();
  raw.decoding = 'async';
  raw.onload = () => {
    void stripBlackBackground(raw).then((img) => {
      pigImg = img;
      imgReady = true;
    });
  };
  raw.onerror = () => {
    pigImg = raw;
    imgReady = true;
  };
  raw.src = pigUrl;

  loadMoneyTexture();
}

function loadMoneyTexture() {
  if (moneyTexture) return;

  const raw = new Image();
  raw.decoding = 'async';
  raw.onload = () => {
    void stripBlackBackground(raw).then((img) => {
      moneyTexture = Texture.from(img);
      moneyBaseScale = 1 / Math.max(1, moneyTexture.width);
      moneyTextureReady = true;
    });
  };
  raw.onerror = () => {
    moneyTexture = Texture.from(raw);
    moneyBaseScale = 1 / Math.max(1, moneyTexture.width || 1);
    moneyTextureReady = true;
  };
  raw.src = moneyStackUrl;
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/** Aspect ratio of one bill (height / width). */
function billAspect(): number {
  if (!moneyTexture || moneyTexture.width <= 0) return 0.5;
  return moneyTexture.height / moneyTexture.width;
}

/**
 * Reset one bill's motion + position. Scale (a static GPU property) is assigned
 * once at pool build and never touched here, so recycling only writes the
 * dynamic position/rotation buffers — no static re-upload.
 */
function recycleBill(i: number, spawnAbove: boolean) {
  const p = moneyParticles[i]!;
  const m = moneyMeta[i]!;
  const aspect = billAspect();
  m.baseX = rand(-MONEY_RAIN_SWAY_MAX, logicalWidth + MONEY_RAIN_SWAY_MAX);
  m.swayAmp = rand(MONEY_RAIN_SWAY_MIN, MONEY_RAIN_SWAY_MAX);
  m.swaySpeed = rand(0.6, 2.4);
  m.swayPhase = Math.random() * Math.PI * 2;
  m.vy = rand(MONEY_RAIN_FALL_MIN, MONEY_RAIN_FALL_MAX);
  m.vr = rand(-MONEY_RAIN_SPIN_MAX, MONEY_RAIN_SPIN_MAX);
  const billH = (p.scaleX / moneyBaseScale) * aspect;
  // Initial fill spreads bills across the whole height; recycling drops them in
  // just above the top edge.
  p.y = spawnAbove
    ? -billH - Math.random() * logicalHeight * 0.6
    : rand(-billH, logicalHeight);
  p.x = m.baseX + Math.sin(m.swayPhase) * m.swayAmp;
  p.rotation = Math.random() * Math.PI * 2;
}

function targetBillCount(): number {
  const area = Math.max(1, logicalWidth * logicalHeight);
  const n = Math.round(area / MONEY_RAIN_AREA_PER_BILL);
  return Math.max(MONEY_RAIN_MIN_COUNT, Math.min(MONEY_RAIN_MAX_COUNT, n));
}

/** (Re)build the bill pool for the current viewport. One container, one texture. */
function rebuildMoneyPool() {
  if (!app || !moneyTexture || logicalWidth <= 0 || logicalHeight <= 0) return;

  if (!moneyLayer) {
    moneyLayer = new ParticleContainer({
      texture: moneyTexture,
      // Bills move + spin every frame; size/colour/uv are fixed → keep their
      // GPU buffers static so only the position/rotation buffer re-uploads.
      dynamicProperties: {
        position: true,
        rotation: true,
        scale: false,
        color: false,
        uvs: false,
      },
      roundPixels: false,
    });
    moneyLayer.visible = false;
    app.stage.addChild(moneyLayer);
  }

  const want = targetBillCount();
  if (moneyParticles.length === want) return;

  moneyLayer.removeParticles();
  moneyParticles = [];
  moneyMeta = [];
  for (let i = 0; i < want; i += 1) {
    const w = rand(MONEY_RAIN_BILL_MIN_W, MONEY_RAIN_BILL_MAX_W);
    const s = w * moneyBaseScale;
    const p = new Particle({
      texture: moneyTexture,
      anchorX: 0.5,
      anchorY: 0.5,
      scaleX: s,
      scaleY: s,
    });
    moneyParticles.push(p);
    moneyMeta.push({ vy: 0, baseX: 0, swayAmp: 0, swaySpeed: 0, swayPhase: 0, vr: 0 });
    recycleBill(i, false);
    moneyLayer.addParticle(p);
  }
  // One-time flush of the static (scale/uv/colour) buffers.
  moneyLayer.update();
}

/** Advance every bill by dt seconds and flag the position/rotation buffer. */
function updateMoneyRain(dtSeconds: number) {
  if (!moneyLayer || moneyParticles.length === 0) return;
  const dt = Math.min(0.05, dtSeconds); // clamp after tab stalls
  const aspect = billAspect();

  for (let i = 0; i < moneyParticles.length; i += 1) {
    const p = moneyParticles[i]!;
    const m = moneyMeta[i]!;
    p.y += m.vy * dt;
    m.swayPhase += m.swaySpeed * dt;
    p.x = m.baseX + Math.sin(m.swayPhase) * m.swayAmp;
    p.rotation += m.vr * dt;

    const billH = (p.scaleX / moneyBaseScale) * aspect;
    if (p.y - billH * 0.5 > logicalHeight) {
      recycleBill(i, true);
    }
  }
  // No update() here: position + rotation are dynamic properties, so their GPU
  // buffers re-upload automatically each render. Static buffers stay untouched.
}

function startMoneyRain() {
  rebuildMoneyPool();
  if (!moneyLayer) return;
  // Re-seed positions across the full height for an instant dense screen.
  for (let i = 0; i < moneyParticles.length; i += 1) recycleBill(i, false);
  rainAlpha = 1;
  moneyLayer.alpha = 1;
  moneyLayer.visible = true;
  lastRainTime = 0;
}

function stopMoneyRain() {
  rainAlpha = 0;
  if (moneyLayer) moneyLayer.visible = false;
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
  canvasUploaded = false;
  canvasSig = '';

  // Re-density + re-seed the downpour for the new viewport if it's running.
  if (moneyTextureReady && moneyLayer && moneyLayer.visible) {
    rebuildMoneyPool();
    for (let i = 0; i < moneyParticles.length; i += 1) recycleBill(i, false);
  }
}

function uploadOffscreenTexture() {
  layerTexture?.source.update();
}

function advanceSession(session: ActiveSession, now: number) {
  const elapsed = now - session.phaseStart;
  const targetY = pigImg ? computePigSpriteDrawSize(pigImg, 1).height * 0.5 : 0;
  const startY = -logicalHeight * 0.22;

  switch (session.phase) {
    case 'descend': {
      session.descendProgress = Math.min(1, elapsed / PIG_DESCEND_MS);
      const t = session.descendProgress;
      session.pigY = startY + (targetY - startY) * t;
      session.pigX = logicalWidth * 0.5;

      if (elapsed >= PIG_DESCEND_MS) {
        session.phase = 'rain';
        session.phaseStart = now;
        session.pigY = targetY;
      }
      break;
    }
    case 'rain': {
      session.pigY = targetY;
      session.pigX = logicalWidth * 0.5;
      session.descendProgress = 1;

      // Kick off the GPU downpour + game-screen shake on the first rain frame.
      if (!session.rainAnnounced) {
        session.rainAnnounced = true;
        startMoneyRain();
        session.onRainChange?.(true);
      }

      // The money downpour fills the whole screen over a fixed duration; then
      // everything fades out before the reward lands on the house.
      if (elapsed >= MONEY_VIDEO_FILL_MS) {
        session.phase = 'fade';
        session.phaseStart = now;
        session.onRainChange?.(false);
      }
      break;
    }
    case 'fade': {
      // Pig + money downpour fade out together before the reward lands.
      session.pigAlpha = Math.max(0, 1 - elapsed / PIG_BANK_FADE_MS);
      rainAlpha = session.pigAlpha;
      if (elapsed >= PIG_BANK_FADE_MS) {
        stopMoneyRain();
        session.phase = 'reward';
        session.phaseStart = now;
        session.pigAlpha = 0;
      }
      break;
    }
    case 'reward': {
      // Money has vanished — now credit the house (+$ float on the estate).
      if (!session.rewardFired) {
        session.rewardFired = true;
        session.onReward?.();
      }
      if (elapsed >= PIG_BANK_REWARD_HOLD_MS) {
        session.phase = 'done';
      }
      break;
    }
    default:
      break;
  }
}

function renderFrame(now: number) {
  if (!ready || !offscreenCtx || !app || !imgReady || !pigImg) return;
  if (logicalWidth <= 0 || logicalHeight <= 0) return;

  for (const session of activeSessions) {
    if (session.phase !== 'done') advanceSession(session, now);
  }

  // Animate the GPU money downpour (one batched container).
  if (moneyLayer && moneyLayer.visible) {
    const dt = lastRainTime > 0 ? (now - lastRainTime) / 1000 : 0;
    lastRainTime = now;
    if (dt > 0) updateMoneyRain(dt);
    moneyLayer.alpha = rainAlpha;
  }

  const primary = activeSessions[0];
  const pigState: PigDrawState | null =
    primary && primary.phase !== 'done' ? primary : null;

  if (pigState) {
    const sig = `${pigState.pigX.toFixed(1)}|${pigState.pigY.toFixed(1)}|${pigState.descendProgress.toFixed(3)}|${pigState.pigAlpha.toFixed(3)}|${pigState.showRewardLabel ? 1 : 0}|${pigState.rewardLabelPop.toFixed(3)}`;
    if (sig !== canvasSig || !canvasUploaded) {
      canvasSig = sig;
      drawPigBankFrame(offscreenCtx, logicalWidth, logicalHeight, bufferDpr, pigImg, pigState);
      uploadOffscreenTexture();
      canvasUploaded = true;
    }
  } else if (canvasUploaded) {
    offscreenCtx.setTransform(bufferDpr, 0, 0, bufferDpr, 0, 0);
    offscreenCtx.clearRect(0, 0, logicalWidth, logicalHeight);
    uploadOffscreenTexture();
    canvasUploaded = false;
    canvasSig = '';
  }

  for (let i = activeSessions.length - 1; i >= 0; i -= 1) {
    const session = activeSessions[i]!;
    if (session.phase === 'done') {
      session.resolve();
      activeSessions.splice(i, 1);
    }
  }

  app.render();
}

function syncPixiTicker(now: number) {
  if (!ready) return;
  if (isGameplayPaused()) return;
  if (activeSessions.length === 0) return;
  renderFrame(now);
  syncTickerRegistration();
}

function syncTickerRegistration() {
  const busy = activeSessions.length > 0;
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

export function isPigBankCanvasReady(): boolean {
  return ready && imgReady;
}

export function isPigBankCanvasSized(): boolean {
  return logicalWidth > 0 && logicalHeight > 0;
}

export function mountPigBankCanvas(
  visibleCanvas: HTMLCanvasElement,
  width = 0,
  height = 0,
): Promise<void> {
  loadImages();

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
      throw new Error('pig-bank: offscreen 2d context unavailable');
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

export function resizePigBankCanvas(width: number, height: number): void {
  if (!ready || width <= 0 || height <= 0) return;
  resizeOffscreenBuffer(width, height);
}

export function unmountPigBankCanvas(): void {
  unregisterAvatarMotionTick(syncPixiTicker);
  tickRegistered = false;

  abortMoneyRain();
  for (const session of activeSessions) {
    session.resolve();
  }
  activeSessions.length = 0;

  canvasSig = '';
  canvasUploaded = false;

  // Money layer + texture are destroyed with the app (children/texture: true).
  moneyLayer = null;
  moneyParticles = [];
  moneyMeta = [];
  moneyTexture = null;
  moneyTextureReady = false;
  rainAlpha = 0;
  lastRainTime = 0;

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

/** Tell any rain-announcing session the downpour stopped + hide the bills. */
function abortMoneyRain() {
  for (const session of activeSessions) {
    if (session.rainAnnounced) session.onRainChange?.(false);
  }
  stopMoneyRain();
}

export function cancelPigBankSession(): void {
  abortMoneyRain();
  for (const session of activeSessions) {
    session.resolve();
  }
  activeSessions.length = 0;
  canvasSig = '';
  canvasUploaded = false;

  if (offscreenCtx && logicalWidth > 0 && logicalHeight > 0) {
    offscreenCtx.setTransform(bufferDpr, 0, 0, bufferDpr, 0, 0);
    offscreenCtx.clearRect(0, 0, logicalWidth, logicalHeight);
    uploadOffscreenTexture();
    app?.render();
  }
  syncTickerRegistration();
}

export function spawnPigBankSession(spec: PigBankSpawnSpec): Promise<void> {
  if (!ready || !offscreenCtx || logicalWidth <= 0 || logicalHeight <= 0 || !imgReady) {
    return Promise.resolve();
  }

  const now = performance.now();
  const id = nextSessionId++;

  return new Promise((resolve) => {
    activeSessions.push({
      id,
      pigX: logicalWidth * 0.5,
      pigY: -logicalHeight * 0.22,
      descendProgress: 0,
      pigAlpha: 1,
      showRewardLabel: false,
      rewardLabelPop: 0,
      phase: 'descend',
      phaseStart: now,
      rewardFired: false,
      rainAnnounced: false,
      onReward: spec.onReward,
      onRainChange: spec.onRainChange,
      resolve,
    });
    syncTickerRegistration();
    syncPixiTicker(now);
  });
}
