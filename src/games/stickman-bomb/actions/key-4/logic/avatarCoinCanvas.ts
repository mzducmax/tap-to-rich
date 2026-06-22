/**
 * Single-canvas batch renderer — money train + pooled falling coins.
 * One compositor layer, one draw pass per frame.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import {
  AVATAR_COIN_GRAVITY,
  AVATAR_COIN_RAIN_BURST_MAX,
  AVATAR_COIN_RAIN_BURST_MIN,
  AVATAR_COIN_RAIN_MAX_SPEED,
  AVATAR_COIN_RAIN_MIN_SPEED,
  AVATAR_COIN_RAIN_SPAWN_INTERVAL_MS,
  AVATAR_COIN_RAIN_SPRITE_SIZE,
  AVATAR_COIN_REWARD,
  AVATAR_COIN_TERMINAL_VY,
  MONEY_TRAIN_BOB_AMPLITUDE,
  MONEY_TRAIN_LAND_FLOAT_MS,
  MONEY_TRAIN_LAND_FLOAT_POOL,
  MONEY_TRAIN_MAX_TILT_RAD,
  MONEY_TRAIN_SMOKE_BURST_MAX,
  MONEY_TRAIN_SMOKE_BURST_MIN,
  MONEY_TRAIN_SMOKE_EMIT_MS,
  MONEY_TRAIN_SMOKE_POOL,
  MONEY_TRAIN_SPARK_POOL,
  MONEY_TRAIN_TRAIL_POOL,
  MONEY_TRAIN_WIDTH_RATIO,
} from '../config/avatarCoinConfig';
import { AVATAR_COIN_MAX_RAIN } from '../config/avatarCoinPerformance';
import { goldCoinUrl, moneyTrainUrl } from '../config/moneyTrainAssets';
import { bakeTrainSprite, bakeTransparentSprite, enrichCoinSprite } from './bakeTransparentSprite';
import {
  bakeLandFloatSprite,
  drawBakedLandFloat,
  getLandFloatEase,
  type LandFloatSprite,
} from './landFloatSprite';
import { pickRandomTrainSpawn } from './moneyTrainSpawn';
import {
  registerAvatarMotionTick,
  unregisterAvatarMotionTick,
} from '../../key-3/logic/avatarMotionTicker';

type FallingCoin = {
  active: boolean;
  groupId: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  spin: number;
  swayPhase: number;
  alpha: number;
};

type SmokePuff = {
  active: boolean;
  groupId: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  born: number;
  life: number;
  warmth: number;
  kind: number;
};

type CoinSpark = {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  born: number;
  life: number;
};

type TrailMark = {
  active: boolean;
  groupId: number;
  cx: number;
  cy: number;
  w: number;
  h: number;
  tilt: number;
  born: number;
  life: number;
};

type LandFloat = {
  active: boolean;
  x: number;
  y: number;
  born: number;
  life: number;
  drift: number;
};

export type EstateZone = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

type TrainSession = {
  groupId: number;
  cx: number;
  cy: number;
  vx: number;
  vy: number;
  trainW: number;
  trainH: number;
  spawning: boolean;
  zone: EstateZone;
  landings: number;
  maxLandings: number;
  onLand: () => void;
  lastSpawnMs: number;
  startedMs: number;
  smokeMs: number;
  dropPhase: number;
  trailMs: number;
  enteredScreen: boolean;
  crossedEstate: boolean;
};

export type CoinRainGroup = number;

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;

let trainSprite: HTMLCanvasElement | null = null;
let coinSprite: HTMLCanvasElement | null = null;
let trainAspect = 768 / 256;
let coinReady = false;
let trainReady = false;

let cssW = 0;
let cssH = 0;
let dpr = 1;

const pool: FallingCoin[] = Array.from({ length: AVATAR_COIN_MAX_RAIN }, () => ({
  active: false,
  groupId: 0,
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  size: 0,
  rotation: 0,
  spin: 0,
  swayPhase: 0,
  alpha: 1,
}));

const smokePool: SmokePuff[] = Array.from({ length: MONEY_TRAIN_SMOKE_POOL }, () => ({
  active: false,
  groupId: 0,
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  r: 0,
  born: 0,
  life: 0,
  warmth: 0,
  kind: 0,
}));

const sparkPool: CoinSpark[] = Array.from({ length: MONEY_TRAIN_SPARK_POOL }, () => ({
  active: false,
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  born: 0,
  life: 0,
}));

const trailPool: TrailMark[] = Array.from({ length: MONEY_TRAIN_TRAIL_POOL }, () => ({
  active: false,
  groupId: 0,
  cx: 0,
  cy: 0,
  w: 0,
  h: 0,
  tilt: 0,
  born: 0,
  life: 0,
}));

const landFloatPool: LandFloat[] = Array.from({ length: MONEY_TRAIN_LAND_FLOAT_POOL }, () => ({
  active: false,
  x: 0,
  y: 0,
  born: 0,
  life: 0,
  drift: 0,
}));

const landFloatLabel = `+${AVATAR_COIN_REWARD}$`;
let landFloatSprite: LandFloatSprite | null = null;

const sessions = new Map<number, TrainSession>();
const cancelledGroups = new Set<number>();

let nextGroupId = 1;
let tickRegistered = false;
let assetsLoading: Promise<void> | null = null;

function syncTicker() {
  const busy =
    sessions.size > 0 ||
    pool.some((c) => c.active) ||
    smokePool.some((p) => p.active) ||
    sparkPool.some((s) => s.active) ||
    trailPool.some((t) => t.active) ||
    landFloatPool.some((f) => f.active);
  if (busy && !tickRegistered) {
    registerAvatarMotionTick(tickCanvas);
    tickRegistered = true;
    return;
  }
  if (!busy && tickRegistered) {
    unregisterAvatarMotionTick(tickCanvas);
    tickRegistered = false;
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${url}`));
    img.src = url;
  });
}

function ensureAssets() {
  if (assetsLoading) return assetsLoading;
  assetsLoading = (async () => {
    const [trainRaw, coinRaw] = await Promise.all([
      loadImage(moneyTrainUrl),
      loadImage(goldCoinUrl),
    ]);
    trainSprite = bakeTrainSprite(trainRaw);
    coinSprite = enrichCoinSprite(bakeTransparentSprite(coinRaw));
    if (trainSprite.width > 0 && trainSprite.height > 0) {
      trainAspect = trainSprite.width / trainSprite.height;
    }
    trainReady = true;
    coinReady = true;
  })().catch(() => {
    assetsLoading = null;
  });
  return assetsLoading;
}

function acquireCoin(): FallingCoin | null {
  return pool.find((c) => !c.active) ?? null;
}

function acquireSmoke(): SmokePuff | null {
  return smokePool.find((p) => !p.active) ?? null;
}

function acquireSpark(): CoinSpark | null {
  return sparkPool.find((s) => !s.active) ?? null;
}

function acquireTrail(): TrailMark | null {
  return trailPool.find((t) => !t.active) ?? null;
}

function acquireLandFloat(): LandFloat | null {
  return landFloatPool.find((f) => !f.active) ?? null;
}

function randBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function getTrainMotion(session: TrainSession) {
  const speed = Math.hypot(session.vx, session.vy) || 1;
  const px = session.vx / speed;
  const py = session.vy / speed;
  const faceRight = session.vx >= 0;
  const face = faceRight ? -1 : 1;
  const tiltRaw = Math.atan2(session.vy, Math.abs(session.vx) || 1e-4);
  const tilt = Math.max(
    -MONEY_TRAIN_MAX_TILT_RAD,
    Math.min(MONEY_TRAIN_MAX_TILT_RAD, tiltRaw),
  );
  const rotation = faceRight ? tilt : -tilt;
  return {
    px,
    py,
    ox: -py,
    oy: px,
    speed,
    angle: rotation,
    tilt,
    face,
    faceRight,
  };
}

function getTrainPose(session: TrainSession, now: number) {
  const bob = Math.sin(now * 0.0048 + session.startedMs * 0.001) * MONEY_TRAIN_BOB_AMPLITUDE;
  const wobble = Math.sin(now * 0.007 + session.dropPhase) * 0.018;
  const motion = getTrainMotion(session);
  return {
    cx: session.cx + motion.ox * bob * 0.12,
    cy: session.cy + bob,
    angle: motion.angle + wobble,
    ...motion,
    bob,
    wobble,
  };
}

function emitTrainSmoke(
  session: TrainSession,
  now: number,
  mode: 'burst' | 'chimney' | 'wheel' = 'burst',
) {
  const puff = acquireSmoke();
  if (!puff) return;

  const { cx, cy, px, py, ox, oy, speed } = getTrainPose(session, now);
  let along = (Math.random() - 0.5) * session.trainW * 0.94;
  let across = (Math.random() - 0.5) * session.trainH * 0.68;

  if (mode === 'chimney') {
    along = session.trainW * randBetween(0.2, 0.38);
    across = -session.trainH * randBetween(0.1, 0.34);
  } else if (mode === 'wheel') {
    along = randBetween(-session.trainW * 0.46, session.trainW * 0.46);
    across = session.trainH * randBetween(0.14, 0.4);
  }

  puff.active = true;
  puff.groupId = session.groupId;
  puff.x = cx + px * along + ox * across;
  puff.y = cy + py * along + oy * across;
  puff.vx = -px * speed * 0.14 + ox * randBetween(-22, 22);
  puff.vy = -py * speed * 0.1 - randBetween(16, 48) + oy * randBetween(-16, 16);
  puff.r = mode === 'chimney' ? randBetween(7, 16) : randBetween(5, 22);
  puff.born = now;
  puff.life = mode === 'chimney' ? randBetween(620, 980) : randBetween(480, 860);
  puff.warmth = mode === 'chimney' ? randBetween(0.78, 1) : randBetween(0.15, 0.72);
  puff.kind = puff.warmth > 0.7 ? 0 : Math.random() < 0.55 ? 1 : 2;
}

function emitTrainSmokeCloud(session: TrainSession, now: number, dense = false) {
  const min = dense ? MONEY_TRAIN_SMOKE_BURST_MIN + 2 : MONEY_TRAIN_SMOKE_BURST_MIN;
  const max = dense ? MONEY_TRAIN_SMOKE_BURST_MAX + 3 : MONEY_TRAIN_SMOKE_BURST_MAX;
  const count = Math.floor(randBetween(min, max + 0.99));
  for (let i = 0; i < count; i += 1) {
    const roll = Math.random();
    const mode = roll < 0.24 ? 'chimney' : roll < 0.48 ? 'wheel' : 'burst';
    emitTrainSmoke(session, now, mode);
  }
}

function emitTrail(session: TrainSession, now: number) {
  const mark = acquireTrail();
  if (!mark) return;
  const { cx, cy, angle } = getTrainPose(session, now);
  mark.active = true;
  mark.groupId = session.groupId;
  mark.cx = cx;
  mark.cy = cy + session.trainH * 0.06;
  mark.w = session.trainW * 0.92;
  mark.h = session.trainH * 0.22;
  mark.tilt = angle;
  mark.born = now;
  mark.life = 420 + Math.random() * 180;
}

function ensureLandFloatSprite() {
  if (!landFloatSprite) {
    landFloatSprite = bakeLandFloatSprite(landFloatLabel);
  }
  return landFloatSprite;
}

function spawnLandFloat(x: number, y: number, now: number) {
  const slot = acquireLandFloat();
  if (!slot) return;
  ensureLandFloatSprite();
  slot.active = true;
  slot.x = x + (Math.random() - 0.5) * 12;
  slot.y = y;
  slot.born = now;
  slot.life = MONEY_TRAIN_LAND_FLOAT_MS;
  slot.drift = (Math.random() - 0.5) * 22;
}
function emitSparks(x: number, y: number, now: number) {
  const count = 2 + Math.floor(Math.random() * 2);
  for (let i = 0; i < count; i += 1) {
    const spark = acquireSpark();
    if (!spark) return;
    spark.active = true;
    spark.x = x + (Math.random() - 0.5) * 14;
    spark.y = y + (Math.random() - 0.5) * 8;
    spark.vx = (Math.random() - 0.5) * 48;
    spark.vy = -20 - Math.random() * 36;
    spark.born = now;
    spark.life = 220 + Math.random() * 180;
  }
}

function spawnCoinFromTrain(session: TrainSession, now: number): FallingCoin | null {
  const coin = acquireCoin();
  if (!coin) return null;

  const size = AVATAR_COIN_RAIN_SPRITE_SIZE * (0.84 + Math.random() * 0.38);
  const wagonOffset = (Math.random() - 0.5) * session.trainW * 0.68;
  const { cx, cy } = getTrainPose(session, now);
  const originX = cx + wagonOffset;
  const originY = cy + session.trainH * 0.1 + Math.random() * session.trainH * 0.14;

  coin.active = true;
  coin.groupId = session.groupId;
  coin.x = originX;
  coin.y = originY;
  coin.size = size;
  coin.vx = session.vx * 0.12 + (Math.random() - 0.5) * 26;
  coin.vy = session.vy * 0.08 + 28 + Math.random() * 32;
  coin.rotation = Math.random() * Math.PI * 2;
  coin.spin = (Math.random() > 0.5 ? 1 : -1) * (2.2 + Math.random() * 4.6);
  coin.swayPhase = Math.random() * Math.PI * 2;
  coin.alpha = 1;
  emitSparks(originX, originY, now);
  void now;
  return coin;
}

function isInZone(x: number, y: number, zone: EstateZone) {
  return x >= zone.left && x <= zone.right && y >= zone.top && y <= zone.bottom;
}

function drawTrainShadow(session: TrainSession, now: number) {
  if (!ctx) return;
  const { cx, cy, angle } = getTrainPose(session, now);
  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.ellipse(
    cx,
    cy + session.trainH * 0.4,
    session.trainW * 0.34,
    session.trainH * 0.12,
    angle,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.restore();
}

function drawTrain(session: TrainSession, now: number) {
  if (!ctx || !trainSprite || !trainReady) return;
  const { cx, cy, angle, face } = getTrainPose(session, now);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.scale(face, 1);
  ctx.drawImage(
    trainSprite,
    -session.trainW * 0.5,
    -session.trainH * 0.5,
    session.trainW,
    session.trainH,
  );
  ctx.restore();
}

function drawSmokePuff(puff: SmokePuff, t: number) {
  if (!ctx) return;
  const alpha = (1 - t * t) * (0.22 + puff.warmth * 0.28);
  const radius = puff.r * (0.65 + t * 1.15);
  const core = ctx.createRadialGradient(
    puff.x - radius * 0.22,
    puff.y - radius * 0.28,
    0,
    puff.x,
    puff.y,
    radius,
  );

  if (puff.kind === 0) {
    core.addColorStop(0, `rgba(255,252,240,${alpha * 1.1})`);
    core.addColorStop(0.35, `rgba(226,232,240,${alpha * 0.85})`);
    core.addColorStop(0.72, `rgba(148,163,184,${alpha * 0.42})`);
    core.addColorStop(1, 'rgba(148,163,184,0)');
  } else if (puff.kind === 1) {
    core.addColorStop(0, `rgba(226,232,240,${alpha})`);
    core.addColorStop(0.45, `rgba(148,163,184,${alpha * 0.62})`);
    core.addColorStop(1, 'rgba(100,116,139,0)');
  } else {
    core.addColorStop(0, `rgba(100,116,139,${alpha * 0.75})`);
    core.addColorStop(0.5, `rgba(51,65,85,${alpha * 0.45})`);
    core.addColorStop(1, 'rgba(30,41,59,0)');
  }

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(puff.x, puff.y, radius, 0, Math.PI * 2);
  ctx.fill();

  if (puff.warmth > 0.55 && t < 0.35) {
    ctx.globalAlpha = (1 - t / 0.35) * puff.warmth * 0.35;
    ctx.fillStyle = 'rgba(253,224,71,0.55)';
    ctx.beginPath();
    ctx.arc(puff.x - radius * 0.12, puff.y - radius * 0.18, radius * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawSmoke(now: number) {
  if (!ctx) return;
  for (const puff of smokePool) {
    if (!puff.active) continue;
    const t = (now - puff.born) / puff.life;
    if (t >= 1) {
      puff.active = false;
      continue;
    }
    drawSmokePuff(puff, t);
  }
}

function drawSparks(now: number) {
  if (!ctx) return;
  for (const spark of sparkPool) {
    if (!spark.active) continue;
    const t = (now - spark.born) / spark.life;
    if (t >= 1) {
      spark.active = false;
      continue;
    }
    ctx.save();
    ctx.globalAlpha = (1 - t) * 0.95;
    ctx.fillStyle = t < 0.35 ? '#fef9c3' : '#fbbf24';
    ctx.beginPath();
    ctx.arc(spark.x, spark.y, 1.6 + (1 - t) * 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawTrails(now: number) {
  if (!ctx) return;
  for (const mark of trailPool) {
    if (!mark.active) continue;
    const t = (now - mark.born) / mark.life;
    if (t >= 1) {
      mark.active = false;
      continue;
    }
    const alpha = (1 - t) * 0.42;
    ctx.save();
    ctx.translate(mark.cx, mark.cy);
    ctx.rotate(mark.tilt);
    const grad = ctx.createLinearGradient(-mark.w * 0.5, 0, mark.w * 0.5, 0);
    grad.addColorStop(0, 'rgba(250,204,21,0)');
    grad.addColorStop(0.22, `rgba(253,224,71,${alpha})`);
    grad.addColorStop(0.5, `rgba(34,197,94,${alpha * 0.72})`);
    grad.addColorStop(0.78, `rgba(251,191,36,${alpha * 0.85})`);
    grad.addColorStop(1, 'rgba(250,204,21,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(-mark.w * 0.5, -mark.h * 0.5, mark.w, mark.h);
    ctx.restore();
  }
}

function drawLandFloats(now: number) {
  if (!ctx) return;
  const sprite = landFloatSprite ?? ensureLandFloatSprite();
  const risePx = 82;

  for (const f of landFloatPool) {
    if (!f.active) continue;
    const t = (now - f.born) / f.life;
    if (t >= 1) {
      f.active = false;
      continue;
    }

    const { rise, scale, alpha } = getLandFloatEase(t);
    drawBakedLandFloat(
      ctx,
      sprite,
      f.x + f.drift * t,
      f.y,
      rise * risePx,
      scale,
      alpha,
    );
  }
}

function drawCoin(c: FallingCoin) {
  if (!ctx || !coinSprite || !coinReady) return;
  const half = c.size * 0.5;
  ctx.save();
  ctx.globalAlpha = c.alpha;
  ctx.translate(c.x, c.y);
  ctx.rotate(c.rotation);
  ctx.drawImage(coinSprite, -half, -half, c.size, c.size);
  ctx.restore();
}

function isTrainDrawable(session: TrainSession) {
  const halfW = session.trainW * 0.52;
  const halfH = session.trainH * 0.52;
  return (
    session.cx + halfW >= 0 &&
    session.cx - halfW <= cssW &&
    session.cy + halfH >= 0 &&
    session.cy - halfH <= cssH
  );
}

function isTrainFullyOutside(session: TrainSession) {
  const halfW = session.trainW * 0.52;
  const halfH = session.trainH * 0.52;
  const pad = Math.max(session.trainW, session.trainH) * 0.12;
  return (
    session.cx + halfW < -pad ||
    session.cx - halfW > cssW + pad ||
    session.cy + halfH < -pad ||
    session.cy - halfH > cssH + pad
  );
}

function isOverEstate(session: TrainSession) {
  const halfW = session.trainW * 0.55;
  const halfH = session.trainH * 0.55;
  return (
    session.cx + halfW > session.zone.left &&
    session.cx - halfW < session.zone.right &&
    session.cy + halfH > session.zone.top - session.trainH * 0.75 &&
    session.cy - halfH < session.zone.bottom + session.trainH * 0.28
  );
}

function hasPassedEstate(session: TrainSession) {
  if (!session.crossedEstate) return false;

  const zoneCx = (session.zone.left + session.zone.right) * 0.5;
  const zoneCy = (session.zone.top + session.zone.bottom) * 0.5;
  const toZoneX = zoneCx - session.cx;
  const toZoneY = zoneCy - session.cy;
  const ahead = toZoneX * session.vx + toZoneY * session.vy;

  return ahead < -session.trainW * 0.15;
}

function shouldStopSpawning(session: TrainSession) {
  if (!session.enteredScreen) return false;
  return isTrainFullyOutside(session);
}

function tickCanvas(now: number) {
  if (!ctx || !canvas) return;

  ctx.clearRect(0, 0, cssW, cssH);
  const dt = 0.016;

  for (const [groupId, session] of sessions) {
    if (cancelledGroups.has(groupId)) continue;

    session.cx += session.vx * dt;
    session.cy += session.vy * dt;

    if (isTrainDrawable(session)) {
      session.enteredScreen = true;
    }

    const overEstate = isOverEstate(session);
    if (overEstate) {
      session.crossedEstate = true;
    }

    const visible = isTrainDrawable(session);

    if (visible && now - session.smokeMs >= MONEY_TRAIN_SMOKE_EMIT_MS) {
      session.smokeMs = now;
      emitTrainSmokeCloud(session, now, overEstate);
      if (overEstate && Math.random() < 0.55) {
        emitTrainSmokeCloud(session, now, true);
      }
    }

    if (visible && now - session.trailMs >= 52) {
      session.trailMs = now;
      emitTrail(session, now);
    }

    if (
      session.spawning &&
      visible &&
      now - session.lastSpawnMs >= AVATAR_COIN_RAIN_SPAWN_INTERVAL_MS
    ) {
      session.lastSpawnMs = now;
      session.dropPhase += 0.7;
      const burstMin = overEstate
        ? AVATAR_COIN_RAIN_BURST_MIN
        : Math.max(2, AVATAR_COIN_RAIN_BURST_MIN - 1);
      const burstMax = overEstate
        ? AVATAR_COIN_RAIN_BURST_MAX
        : Math.max(burstMin + 1, AVATAR_COIN_RAIN_BURST_MAX - 2);
      const burst = Math.floor(randBetween(burstMin, burstMax + 0.99));
      for (let i = 0; i < burst; i += 1) {
        spawnCoinFromTrain(session, now);
      }
    }

    if (session.spawning && shouldStopSpawning(session)) {
      session.spawning = false;
    }
  }

  for (const puff of smokePool) {
    if (!puff.active || cancelledGroups.has(puff.groupId)) continue;
    puff.x += puff.vx * dt;
    puff.y += puff.vy * dt;
    puff.vx += Math.sin(now * 0.0028 + puff.born * 0.001) * 6 * dt;
    puff.vy -= 10 * dt;
    puff.r += 14 * dt;
  }

  for (const spark of sparkPool) {
    if (!spark.active) continue;
    spark.x += spark.vx * dt;
    spark.y += spark.vy * dt;
    spark.vy += 120 * dt;
  }

  for (const c of pool) {
    if (!c.active) continue;
    if (cancelledGroups.has(c.groupId)) {
      c.active = false;
      continue;
    }

    const session = sessions.get(c.groupId);
    if (!session) {
      c.active = false;
      continue;
    }

    c.vy += AVATAR_COIN_GRAVITY * dt;
    if (c.vy > AVATAR_COIN_TERMINAL_VY) c.vy = AVATAR_COIN_TERMINAL_VY;
    c.vx *= 1 - 0.65 * dt;
    c.x += (c.vx + Math.sin(now * 0.0016 + c.swayPhase) * 9) * dt;
    c.y += c.vy * dt;
    c.rotation += c.spin * dt + c.vx * 0.0009;

    if (isInZone(c.x, c.y, session.zone)) {
      c.active = false;
      if (!cancelledGroups.has(c.groupId) && session.landings < session.maxLandings) {
        spawnLandFloat(c.x, c.y, now);
        session.landings += 1;
        session.onLand();
      }
      continue;
    }

    if (c.y > cssH + 48 || c.x < -48 || c.x > cssW + 48) {
      c.active = false;
    }
  }

  drawTrails(now);
  drawSmoke(now);

  for (const [groupId, session] of sessions) {
    if (cancelledGroups.has(groupId)) continue;
    if (isTrainDrawable(session)) {
      drawTrainShadow(session, now);
      drawTrain(session, now);
    }
  }
  drawSparks(now);

  for (const c of pool) {
    if (!c.active) continue;
    drawCoin(c);
  }

  drawLandFloats(now);

  for (const [groupId, session] of [...sessions]) {
    if (cancelledGroups.has(groupId)) {
      sessions.delete(groupId);
      continue;
    }
    const trainDone =
      session.enteredScreen &&
      isTrainFullyOutside(session) &&
      (session.crossedEstate || session.landings > 0);
    const hasCoins = pool.some((c) => c.active && c.groupId === groupId);
    const hasSmoke = smokePool.some((p) => p.active && p.groupId === groupId);
    const hasTrail = trailPool.some((t) => t.active && t.groupId === groupId);
    if (trainDone && !session.spawning && !hasCoins && !hasSmoke && !hasTrail) {
      sessions.delete(groupId);
    }
  }

  syncTicker();
}

export function mountAvatarCoinCanvas(el: HTMLCanvasElement) {
  if (canvas === el && ctx) return;
  unmountAvatarCoinCanvas();

  canvas = el;
  ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
  void ensureAssets();
}

export function unmountAvatarCoinCanvas() {
  for (const c of pool) c.active = false;
  for (const p of smokePool) p.active = false;
  for (const s of sparkPool) s.active = false;
  for (const t of trailPool) t.active = false;
  for (const f of landFloatPool) f.active = false;
  sessions.clear();
  cancelledGroups.clear();
  syncTicker();
  canvas = null;
  ctx = null;
}

export function resizeAvatarCoinCanvas(width: number, height: number) {
  if (!canvas || !ctx) return;
  cssW = Math.max(1, width);
  cssH = Math.max(1, height);
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  canvas.style.width = `${cssW}px`;
  canvas.style.height = `${cssH}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

export function createCoinRainGroup(): CoinRainGroup {
  return nextGroupId++;
}

export function cancelCoinRainGroup(groupId: CoinRainGroup) {
  cancelledGroups.add(groupId);
  sessions.delete(groupId);
  for (const c of pool) {
    if (c.groupId === groupId) c.active = false;
  }
  for (const p of smokePool) {
    if (p.groupId === groupId) p.active = false;
  }
  for (const t of trailPool) {
    if (t.groupId === groupId) t.active = false;
  }
  syncTicker();
}

export function areMoneyTrainAssetsReady() {
  return trainReady && coinReady;
}

export async function waitForMoneyTrainAssets(maxMs = 4000) {
  void ensureAssets();
  const start = performance.now();
  while (!areMoneyTrainAssetsReady()) {
    if (performance.now() - start > maxMs) break;
    await new Promise((r) => requestAnimationFrame(r));
  }
}

export function startMoneyTrainSession(
  groupId: CoinRainGroup,
  zone: EstateZone,
  maxLandings: number,
  onLand: () => void,
): boolean {
  if (cancelledGroups.has(groupId) || cssW <= 0 || cssH <= 0) return false;

  const trainW = cssW * MONEY_TRAIN_WIDTH_RATIO;
  const trainH = trainW / trainAspect;
  const spawn = pickRandomTrainSpawn(cssW, cssH, trainW, trainH, zone);

  sessions.set(groupId, {
    groupId,
    cx: spawn.cx,
    cy: spawn.cy,
    vx: spawn.vx,
    vy: spawn.vy,
    trainW,
    trainH,
    spawning: true,
    zone,
    landings: 0,
    maxLandings,
    onLand,
    lastSpawnMs: performance.now() - AVATAR_COIN_RAIN_SPAWN_INTERVAL_MS,
    startedMs: performance.now(),
    smokeMs: performance.now() - MONEY_TRAIN_SMOKE_EMIT_MS,
    trailMs: performance.now() - 52,
    dropPhase: Math.random() * Math.PI * 2,
    enteredScreen: false,
    crossedEstate: false,
  });

  syncTicker();
  tickCanvas(performance.now());
  return true;
}

export function hasActiveCoinRain(groupId: CoinRainGroup) {
  if (sessions.has(groupId)) return true;
  if (pool.some((c) => c.active && c.groupId === groupId)) return true;
  if (smokePool.some((p) => p.active && p.groupId === groupId)) return true;
  if (trailPool.some((t) => t.active && t.groupId === groupId)) return true;
  return landFloatPool.some((f) => f.active);
}

export function prewarmAvatarCoinCanvas() {
  ensureLandFloatSprite();
  void ensureAssets();
}
