/**
 * Multi-ball canvas compositor — 1 clear + N drawImage / frame (key 8).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { isGameplayPaused } from '../../../gameplay/logic/gameplayPause';
import {
  registerAvatarMotionTick,
  unregisterAvatarMotionTick,
} from '../../key-3/logic/avatarMotionTicker';
import { footballUrl } from '../config/soccerBallAssets';
import {
  SOCCER_BALL_BG_KEY_THRESHOLD,
  SOCCER_BALL_MAX_DURATION_MS,
  SOCCER_BALL_MAX_EDGE_BOUNCES,
  SOCCER_BALL_RENDER_DPR,
  SOCCER_BALL_ROLL_DUST_INTERVAL_MS,
  SOCCER_BALL_ROLL_DUST_MIN_SPEED,
} from '../config/soccerBallConfig';
import {
  clearSoccerBallHitEffects,
  drawSoccerBallHitEffects,
  hasActiveSoccerBallHitEffects,
  spawnSoccerBallHitEffect,
  spawnSoccerBallRollDust,
} from './soccerBallHitFx';
import {
  ballSpeed,
  createBallSimState,
  createDefaultPhysicsWorld,
  stepBallSim,
  type BallSimState,
  type PhysicsWorld,
  type Rect,
} from './soccerBallPhysics';
import { computeKickSpawn } from './soccerBallSpawn';

type ActiveBall = {
  id: number;
  sim: BallSimState;
  world: PhysicsWorld;
  rotation: number;
  startTime: number;
  lastTick: number;
  lastRollDustAt: number;
  onEstateHit?: () => void;
  resolve: () => void;
};

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let ballImg: HTMLImageElement | null = null;
let imgReady = false;

let cssW = 0;
let cssH = 0;
let dpr = 1;

const activeBalls = new Map<number, ActiveBall>();
let tickRegistered = false;
let fxNow = 0;

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
    const threshold = SOCCER_BALL_BG_KEY_THRESHOLD;

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

function loadBallImage() {
  if (ballImg) return;
  const raw = new Image();
  raw.decoding = 'async';
  raw.onload = () => {
    void stripBlackBackground(raw).then((processed) => {
      ballImg = processed;
      imgReady = true;
      renderFrame(fxNow || performance.now());
    });
  };
  raw.src = footballUrl;
}

function isBusy(now: number) {
  return activeBalls.size > 0 || hasActiveSoccerBallHitEffects(now);
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

function finishBall(id: number) {
  const ball = activeBalls.get(id);
  if (!ball) return;
  const { resolve } = ball;
  activeBalls.delete(id);
  resolve();
  syncTicker(fxNow);
  renderFrame(fxNow);
}

function shouldComplete(ball: ActiveBall, now: number) {
  if (now - ball.startTime >= SOCCER_BALL_MAX_DURATION_MS) return true;
  if (!ball.sim.estateHit) return false;
  if (ball.sim.edgeBounceCount >= SOCCER_BALL_MAX_EDGE_BOUNCES) return true;
  return false;
}

function renderFrame(now: number) {
  if (!ctx || !imgReady || !ballImg) return;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);

  for (const ball of activeBalls.values()) {
    const { x, y, radius } = ball.sim.body;
    const size = radius * 2;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ball.rotation);
    ctx.drawImage(ballImg, -radius, -radius, size, size);
    ctx.restore();
  }

  drawSoccerBallHitEffects(ctx, now);
}

function tickFrame(now: number) {
  fxNow = now;
  if (!ctx) return;

  if (!isGameplayPaused()) {
    for (const [id, ball] of [...activeBalls.entries()]) {
      const dt = Math.min((now - ball.lastTick) / 1000, 0.033);
      ball.lastTick = now;

      const result = stepBallSim(ball.sim, ball.world, dt);
      const speed = ballSpeed(ball.sim.body);
      const { x, y, vx, vy } = ball.sim.body;

      if (result.hitEstate) {
        spawnSoccerBallHitEffect(x, y, 'estate', speed);
        ball.onEstateHit?.();
      }

      if (result.hitEdge) {
        spawnSoccerBallHitEffect(x, y, 'edge', speed);
      }

      if (
        ball.sim.phase === 'edgeRun' &&
        ball.sim.estateHit &&
        speed >= SOCCER_BALL_ROLL_DUST_MIN_SPEED &&
        now - ball.lastRollDustAt >= SOCCER_BALL_ROLL_DUST_INTERVAL_MS
      ) {
        ball.lastRollDustAt = now;
        spawnSoccerBallRollDust(x, y, vx, vy, speed);
      }

      ball.rotation += (speed / ball.sim.body.radius) * dt * 0.9;

      if (shouldComplete(ball, now)) {
        finishBall(id);
      }
    }
  } else {
    for (const ball of activeBalls.values()) {
      ball.lastTick = now;
    }
  }

  renderFrame(now);
  syncTicker(now);
}

export function mountSoccerBallCanvas(el: HTMLCanvasElement) {
  canvas = el;
  ctx = el.getContext('2d');
  loadBallImage();
}

export function unmountSoccerBallCanvas() {
  cancelAllSoccerBallKicks();
  clearSoccerBallHitEffects();
  canvas = null;
  ctx = null;
}

export function resizeSoccerBallCanvas(width: number, height: number) {
  if (!canvas || !ctx || width <= 0 || height <= 0) return;

  cssW = width;
  cssH = height;
  dpr = Math.min(window.devicePixelRatio || 1, SOCCER_BALL_RENDER_DPR);

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const bounds = { left: 0, top: 0, right: width, bottom: height };
  for (const ball of activeBalls.values()) {
    ball.world.bounds = bounds;
  }

  renderFrame(fxNow || performance.now());
}

export function isSoccerBallCanvasReady() {
  return Boolean(ctx);
}

export function isSoccerBallCanvasSized() {
  return cssW > 0 && cssH > 0;
}

export function isSoccerBallKickActive() {
  return activeBalls.size > 0;
}

export type SoccerBallKickSpawn = {
  kickId: number;
  angleDeg: number;
  bounds: Rect;
  estate: Rect;
  onEstateHit?: () => void;
};

export function spawnSoccerBallKick({
  kickId,
  angleDeg,
  bounds,
  estate,
  onEstateHit,
}: SoccerBallKickSpawn): Promise<void> {
  if (!ctx || activeBalls.has(kickId)) return Promise.resolve();

  const spawn = computeKickSpawn(angleDeg, bounds, estate);
  const now = performance.now();
  fxNow = now;

  return new Promise((resolve) => {
    activeBalls.set(kickId, {
      id: kickId,
      sim: createBallSimState(spawn.body),
      world: createDefaultPhysicsWorld(bounds, estate),
      rotation: spawn.aimAngleRad,
      startTime: now,
      lastTick: now,
      lastRollDustAt: 0,
      onEstateHit,
      resolve,
    });
    syncTicker(now);
    renderFrame(now);
  });
}

export function cancelSoccerBallKick(kickId: number) {
  finishBall(kickId);
}

export function cancelAllSoccerBallKicks() {
  for (const id of [...activeBalls.keys()]) {
    finishBall(id);
  }
  clearSoccerBallHitEffects();
  syncTicker(fxNow);
  if (ctx) renderFrame(fxNow);
}
