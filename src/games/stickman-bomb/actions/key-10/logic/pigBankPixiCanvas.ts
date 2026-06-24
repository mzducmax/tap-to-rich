/**
 * PixiJS compositor — pig bank descends + reward label (key P).
 * The money downpour itself is a transparent WebM played as a DOM overlay
 * (see PigBankLayer); this layer only animates the pig and the +$ label.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { Application, Sprite, Texture } from 'pixi.js';
import { isGameplayPaused } from '../../../gameplay/logic/gameplayPause';
import {
  registerAvatarMotionTick,
  unregisterAvatarMotionTick,
} from '../../key-3/logic/avatarMotionTicker';
import { pigUrl } from '../config/pigBankAssets';
import {
  MONEY_VIDEO_FILL_MS,
  PIG_BANK_FADE_MS,
  PIG_BANK_RENDER_DPR,
  PIG_BANK_REWARD_HOLD_MS,
  PIG_BANK_BG_KEY_THRESHOLD,
  PIG_DESCEND_MS,
  PIG_TARGET_Y_RATIO,
} from '../config/pigBankConfig';
import { drawPigBankFrame, type PigDrawState } from './pigBankDraw';

export type PigBankSpawnSpec = {
  onReward?: () => void;
};

type ActiveSession = PigDrawState & {
  id: number;
  phase: 'descend' | 'rain' | 'reward' | 'fade' | 'done';
  phaseStart: number;
  rewardFired: boolean;
  onReward?: () => void;
  resolve: () => void;
};

let app: Application | null = null;
let displaySprite: Sprite | null = null;
let layerTexture: Texture | null = null;
let offscreenCanvas: HTMLCanvasElement | null = null;
let offscreenCtx: CanvasRenderingContext2D | null = null;
let pigImg: HTMLImageElement | null = null;
let imgReady = false;

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
}

function uploadOffscreenTexture() {
  layerTexture?.source.update();
}

function advanceSession(session: ActiveSession, now: number) {
  const elapsed = now - session.phaseStart;
  const targetY = logicalHeight * PIG_TARGET_Y_RATIO;
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

      // The money downpour fills the whole screen over a fixed duration; then
      // everything fades out before the reward lands on the house.
      if (elapsed >= MONEY_VIDEO_FILL_MS) {
        session.phase = 'fade';
        session.phaseStart = now;
      }
      break;
    }
    case 'fade': {
      // Pig + money video fade out together (the video fades via CSS in React).
      session.pigAlpha = Math.max(0, 1 - elapsed / PIG_BANK_FADE_MS);
      if (elapsed >= PIG_BANK_FADE_MS) {
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

  for (const session of activeSessions) {
    session.resolve();
  }
  activeSessions.length = 0;

  canvasSig = '';
  canvasUploaded = false;

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

export function cancelPigBankSession(): void {
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
      onReward: spec.onReward,
      resolve,
    });
    syncTickerRegistration();
    syncPixiTicker(now);
  });
}
