/**
 * PixiJS compositor — 1 sprite / 1 draw call for Trump spawn FX (key 9).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { Application, Sprite, Texture } from 'pixi.js';
import { isGameplayPaused } from '../../../gameplay/logic/gameplayPause';
import {
  registerAvatarMotionTick,
  unregisterAvatarMotionTick,
} from '../../key-3/logic/avatarMotionTicker';
import { trumpUrl, dollarTrumpUrl } from '../config/trumpAssets';
import {
  TRUMP_BG_KEY_THRESHOLD,
  TRUMP_BOX_POP_MS,
  TRUMP_BURST_MS,
  TRUMP_FADE_MS,
  TRUMP_LINE_AMPLITUDE,
  TRUMP_LINE_RISE_MS,
  TRUMP_RENDER_DPR,
  TRUMP_SPRITE_HEIGHT,
  TRUMP_SPRITE_WIDTH,
  TRUMP_STOCK_RISE_MS,
} from '../config/trumpSpawnConfig';
import {
  drawTrumpSpawnFrame,
  type TrumpDrawState,
} from './trumpSpawnDraw';
import { drawTrumpMoneyRain } from './trumpMoneyRain';
import { startTrumpCoinBurst, clearTrumpCoinBurst } from './trumpCoinBurst';
import {
  startTrumpMoneyRain,
  stopTrumpMoneyRainSpawning,
  clearTrumpMoneyRain,
  hasActiveTrumpMoneyRain,
  resizeTrumpMoneyRain,
  setTrumpMoneyRainBillAspect,
  updateTrumpMoneyRain,
} from './trumpMoneyRain';
import {
  clearTrumpStockFloorCache,
  resizeTrumpStockFloor,
} from './trumpStockFloor';
import { buildTrumpMoneyPath, type Point2 } from './trumpSpawnPath';

export type TrumpSpawnSpec = {
  boxCenter: Point2;
  resolveBoxCenter?: () => Point2;
  onLineComplete?: () => void;
};

type ActiveSession = TrumpDrawState & {
  id: number;
  phase: 'pop' | 'line' | 'burst' | 'fade' | 'done';
  phaseStart: number;
  resolveBoxCenter?: () => Point2;
  onLineComplete?: () => void;
  lineCompleteFired: boolean;
  resolve: () => void;
};

let app: Application | null = null;
let displaySprite: Sprite | null = null;
let layerTexture: Texture | null = null;
let offscreenCanvas: HTMLCanvasElement | null = null;
let offscreenCtx: CanvasRenderingContext2D | null = null;
let trumpImg: HTMLImageElement | null = null;
let dollarTrumpImg: HTMLImageElement | null = null;
let imgReady = false;

let logicalWidth = 0;
let logicalHeight = 0;
let bufferDpr = 1;
let ready = false;
let mountPromise: Promise<void> | null = null;

const activeSessions: ActiveSession[] = [];
let nextSessionId = 1;
let tickRegistered = false;
let lastTickMs = 0;

function computeBufferDpr(): number {
  return Math.min(window.devicePixelRatio || 1, TRUMP_RENDER_DPR);
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
    const threshold = TRUMP_BG_KEY_THRESHOLD;

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

function loadTrumpImage() {
  if (trumpImg && dollarTrumpImg) return;

  let trumpLoaded = Boolean(trumpImg);
  let dollarLoaded = Boolean(dollarTrumpImg);

  const tryReady = () => {
    if (trumpLoaded && dollarLoaded) {
      imgReady = true;
    }
  };

  if (!trumpImg) {
    const raw = new Image();
    raw.decoding = 'async';
    raw.onload = () => {
      void stripBlackBackground(raw).then((img) => {
        trumpImg = img;
        trumpLoaded = true;
        tryReady();
      });
    };
    raw.onerror = () => {
      trumpImg = raw;
      trumpLoaded = true;
      tryReady();
    };
    raw.src = trumpUrl;
  }

  if (!dollarTrumpImg) {
    const raw = new Image();
    raw.decoding = 'async';
    raw.onload = () => {
      void stripBlackBackground(raw).then((img) => {
        dollarTrumpImg = img;
        setTrumpMoneyRainBillAspect(
          img.naturalWidth / Math.max(1, img.naturalHeight),
        );
        dollarLoaded = true;
        tryReady();
      });
    };
    raw.onerror = () => {
      dollarTrumpImg = raw;
      dollarLoaded = true;
      tryReady();
    };
    raw.src = dollarTrumpUrl;
  }
}

function resizeOffscreenBuffer(width: number, height: number) {
  if (!offscreenCanvas || !displaySprite || !app || !layerTexture) return;
  if (width <= 0 || height <= 0) return;

  logicalWidth = width;
  logicalHeight = height;
  bufferDpr = computeBufferDpr();
  resizeTrumpMoneyRain(width, height);

  layerTexture.source.resize(width, height, bufferDpr);
  displaySprite.width = width;
  displaySprite.height = height;
  app.renderer.resize(width, height);
  resizeTrumpStockFloor(width, height);
}

function uploadOffscreenTexture() {
  layerTexture?.source.update();
}

function advanceSession(session: ActiveSession, now: number) {
  const elapsed = now - session.phaseStart;

  switch (session.phase) {
    case 'pop': {
      session.boxPop = Math.min(1, elapsed / TRUMP_BOX_POP_MS);
      if (elapsed >= TRUMP_BOX_POP_MS) {
        session.phase = 'line';
        session.phaseStart = now;
        session.lineProgress = 0;
        session.stockProgress = 0;
      }
      break;
    }
    case 'line': {
      session.lineProgress = Math.min(1, elapsed / TRUMP_LINE_RISE_MS);
      session.stockProgress = Math.min(1, elapsed / TRUMP_STOCK_RISE_MS);
      if (session.lineProgress >= 1 && !session.lineCompleteFired) {
        session.lineCompleteFired = true;
        session.onLineComplete?.();
      }
      if (elapsed >= TRUMP_LINE_RISE_MS) {
        session.phase = 'burst';
        session.phaseStart = now;
        startTrumpCoinBurst(session.boxX, session.boxY, now);
        session.burstStarted = true;
      }
      break;
    }
    case 'burst': {
      session.stockProgress = 1;
      if (elapsed >= TRUMP_BURST_MS) {
        session.phase = 'fade';
        session.phaseStart = now;
      }
      break;
    }
    case 'fade': {
      session.stockProgress = 1;
      stopTrumpMoneyRainSpawning();
      session.trumpAlpha = Math.max(0, 1 - elapsed / TRUMP_FADE_MS);
      if (elapsed >= TRUMP_FADE_MS) {
        session.phase = 'done';
      }
      break;
    }
    default:
      break;
  }
}

function renderFrame(now: number) {
  if (!ready || !offscreenCtx || !app || !imgReady || !trumpImg || !dollarTrumpImg) return;
  if (logicalWidth <= 0 || logicalHeight <= 0) return;

  const dtMs = lastTickMs > 0 ? Math.min(48, now - lastTickMs) : 16;
  lastTickMs = now;
  updateTrumpMoneyRain(now, dtMs);

  for (const session of activeSessions) {
    if (session.phase !== 'done') {
      if (session.resolveBoxCenter) {
        const live = session.resolveBoxCenter();
        session.boxX = live.x;
        session.boxY = live.y;
        if (session.linePoints.length > 0) {
          session.linePoints[session.linePoints.length - 1] = live;
        }
      }
      advanceSession(session, now);
    }
  }

  const primary = activeSessions[0];
  if (primary && primary.phase !== 'done') {
    drawTrumpSpawnFrame(
      offscreenCtx,
      logicalWidth,
      logicalHeight,
      bufferDpr,
      trumpImg,
      dollarTrumpImg,
      primary,
      now,
    );
  } else if (hasActiveTrumpMoneyRain()) {
    offscreenCtx.setTransform(bufferDpr, 0, 0, bufferDpr, 0, 0);
    offscreenCtx.clearRect(0, 0, logicalWidth, logicalHeight);
    drawTrumpMoneyRain(offscreenCtx, dollarTrumpImg, 1);
  } else {
    offscreenCtx.setTransform(bufferDpr, 0, 0, bufferDpr, 0, 0);
    offscreenCtx.clearRect(0, 0, logicalWidth, logicalHeight);
  }

  for (let i = activeSessions.length - 1; i >= 0; i--) {
    const session = activeSessions[i]!;
    if (session.phase === 'done') {
      session.resolve();
      activeSessions.splice(i, 1);
    }
  }

  uploadOffscreenTexture();
  app.render();
}

function syncPixiTicker(now: number) {
  if (!ready) return;
  if (isGameplayPaused()) return;
  if (activeSessions.length === 0 && !hasActiveTrumpMoneyRain()) return;
  renderFrame(now);
  syncTickerRegistration();
}

function syncTickerRegistration() {
  const busy = activeSessions.length > 0 || hasActiveTrumpMoneyRain();
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

export function isTrumpSpawnCanvasReady(): boolean {
  return ready && imgReady;
}

export function isTrumpSpawnCanvasSized(): boolean {
  return logicalWidth > 0 && logicalHeight > 0;
}

export function mountTrumpSpawnCanvas(
  visibleCanvas: HTMLCanvasElement,
  width = 0,
  height = 0,
): Promise<void> {
  loadTrumpImage();

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
      throw new Error('trump-spawn: offscreen 2d context unavailable');
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

export function resizeTrumpSpawnCanvas(width: number, height: number): void {
  if (!ready || width <= 0 || height <= 0) return;
  resizeOffscreenBuffer(width, height);
}

export function unmountTrumpSpawnCanvas(): void {
  unregisterAvatarMotionTick(syncPixiTicker);
  tickRegistered = false;

  for (const session of activeSessions) {
    session.resolve();
  }
  activeSessions.length = 0;
  clearTrumpCoinBurst();
  clearTrumpMoneyRain();
  clearTrumpStockFloorCache();

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

export function cancelTrumpSpawnSession(): void {
  for (const session of activeSessions) {
    session.resolve();
  }
  activeSessions.length = 0;
  clearTrumpCoinBurst();
  clearTrumpMoneyRain();
  clearTrumpStockFloorCache();

  if (offscreenCtx && logicalWidth > 0 && logicalHeight > 0) {
    offscreenCtx.setTransform(bufferDpr, 0, 0, bufferDpr, 0, 0);
    offscreenCtx.clearRect(0, 0, logicalWidth, logicalHeight);
    uploadOffscreenTexture();
    app?.render();
  }
  syncTickerRegistration();
}

export function spawnTrumpSession(spec: TrumpSpawnSpec): Promise<void> {
  if (!ready || !offscreenCtx || logicalWidth <= 0 || logicalHeight <= 0 || !imgReady) {
    return Promise.resolve();
  }

  const startY = logicalHeight + 8;
  const startX = logicalWidth * 0.5;
  const end = spec.boxCenter;
  const linePoints = buildTrumpMoneyPath(
    { x: startX, y: startY },
    end,
    TRUMP_LINE_AMPLITUDE,
    Math.random() * 4,
  );

  const now = performance.now();
  const id = nextSessionId++;
  startTrumpMoneyRain(logicalWidth, logicalHeight, now);

  return new Promise((resolve) => {
    activeSessions.push({
      id,
      boxX: end.x,
      boxY: end.y,
      boxPop: 0,
      linePoints,
      lineProgress: 0,
      lineSeed: Math.random(),
      stockProgress: 0,
      burstStarted: false,
      trumpAlpha: 1,
      phase: 'pop',
      phaseStart: now,
      resolveBoxCenter: spec.resolveBoxCenter,
      onLineComplete: spec.onLineComplete,
      lineCompleteFired: false,
      resolve,
    });
    syncTickerRegistration();
    syncPixiTicker(now);
  });
}

/** Anchor beside the estate building (right side), not inside the house. */
export function computeTrumpSpriteAnchor(
  estateRect: DOMRect,
  layerRect: DOMRect,
): Point2 {
  const bx = estateRect.left - layerRect.left;
  const by = estateRect.top - layerRect.top;
  const sideGap = Math.max(8, estateRect.width * 0.04);
  return {
    x: bx + estateRect.width + sideGap + TRUMP_SPRITE_WIDTH * 0.5,
    y: by + estateRect.height * 0.54,
  };
}

export { TRUMP_SPRITE_WIDTH, TRUMP_SPRITE_HEIGHT };
