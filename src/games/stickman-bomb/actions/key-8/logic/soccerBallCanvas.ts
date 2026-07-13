/**
 * Single canvas compositor — a knife falls from the sky and plants at a
 * random spot on screen (key 8).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { isGameplayPaused } from '../../../gameplay/logic/gameplayPause';
import {
  registerAvatarMotionTick,
  unregisterAvatarMotionTick,
} from '../../key-3/logic/avatarMotionTicker';
import { audioManager } from '../../../../../utils/audio';
import {
  KNIFE_FALL_SPEED,
  KNIFE_IMPACT_FX_MS,
  KNIFE_LENGTH,
  KNIFE_SPIN_DIST_FACTOR,
  KNIFE_STUCK_DURATION_MS,
  KNIFE_WIDTH,
  SOCCER_BALL_RENDER_DPR,
} from '../config/soccerBallConfig';
import { computeKnifeSpawn, type Rect } from './soccerBallSpawn';

type ActiveKnife = {
  id: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  landX: number;
  landY: number;
  vx: number;
  vy: number;
  duration: number;
  elapsed: number;
  spinDirection: number;
  numSpins: number;
  rotation: number;
  landAngle: number;
  landed: boolean;
  landedAt: number;
  lastTick: number;
  onLand?: () => void;
  resolve: () => void;
};

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;

let cssW = 0;
let cssH = 0;
let dpr = 1;

const activeKnives = new Map<number, ActiveKnife>();
let tickRegistered = false;
let fxNow = 0;

function isBusy() {
  return activeKnives.size > 0;
}

function syncTicker() {
  const busy = isBusy();
  if (busy && !tickRegistered) {
    registerAvatarMotionTick(tickFrame);
    tickRegistered = true;
  } else if (!busy && tickRegistered) {
    unregisterAvatarMotionTick(tickFrame);
    tickRegistered = false;
  }
}

function finishKnife(id: number) {
  const knife = activeKnives.get(id);
  if (!knife) return;
  const { resolve } = knife;
  activeKnives.delete(id);
  resolve();
  syncTicker();
  renderFrame(fxNow);
}

function drawKnife(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  rotation: number,
  pivotAtTip: boolean,
  penetrationDepth = 0
) {
  const halfL = KNIFE_LENGTH / 2;
  const halfW = KNIFE_WIDTH / 2;

  g.save();
  
  // Set up drop shadow
  g.shadowColor = 'rgba(0, 0, 0, 0.4)';
  g.shadowBlur = 8;
  g.shadowOffsetX = 3;
  g.shadowOffsetY = 3;

  g.translate(x, y);
  g.rotate(rotation);

  // If pivotAtTip is true, translate along local x-axis to keep the tip
  // embedded at -penetrationDepth, turning (x, y) into the target surface pivot.
  const offsetX = pivotAtTip ? (halfL - penetrationDepth) : 0;
  g.translate(offsetX, 0);

  // 1. Blade Body (Gradient metallic silver-grey along the blade length)
  const bladeGrad = g.createLinearGradient(-halfL, -halfW, halfL * 0.55, halfW);
  bladeGrad.addColorStop(0, '#94a3b8'); // steel ridge
  bladeGrad.addColorStop(0.2, '#cbd5e1'); // silver-grey
  bladeGrad.addColorStop(0.5, '#f8fafc'); // shiny highlight
  bladeGrad.addColorStop(0.8, '#cbd5e1'); // silver
  bladeGrad.addColorStop(1, '#475569'); // dark edge shadow

  g.fillStyle = bladeGrad;
  g.beginPath();
  g.moveTo(-halfL, 0); // Tip of the blade (pointing left/forward)
  g.lineTo(halfL * 0.55 - 4, -halfW); // Top blade shoulder
  g.lineTo(halfL * 0.55, 0); // Center base
  g.lineTo(halfL * 0.55 - 4, halfW); // Bottom blade shoulder
  g.closePath();
  g.fill();

  // Blade stroke
  g.strokeStyle = 'rgba(71,85,105,0.8)';
  g.lineWidth = 1.2;
  g.stroke();

  // Upper blade edge highlight (gives sharp feeling)
  g.strokeStyle = '#ffffff';
  g.lineWidth = 1.0;
  g.beginPath();
  g.moveTo(-halfL, 0);
  g.lineTo(halfL * 0.55 - 4, -halfW);
  g.stroke();

  // Highlight glares (bevel glares)
  g.fillStyle = 'rgba(255,255,255,0.35)';
  g.beginPath();
  g.moveTo(-halfL + 18, 0);
  g.lineTo(halfL * 0.55 - 6, -halfW * 0.45);
  g.lineTo(halfL * 0.55 - 6, 0);
  g.closePath();
  g.fill();

  // Lower blade edge shading
  g.fillStyle = 'rgba(15,23,42,0.15)';
  g.beginPath();
  g.moveTo(-halfL + 25, 0);
  g.lineTo(halfL * 0.55 - 6, halfW * 0.45);
  g.lineTo(halfL * 0.55 - 6, 0);
  g.closePath();
  g.fill();

  // Center line/ridge of the double-edged blade
  g.strokeStyle = '#334155';
  g.lineWidth = 1.2;
  g.beginPath();
  g.moveTo(halfL * 0.55, 0);
  g.lineTo(-halfL * 0.8, 0);
  g.stroke();

  // Disable shadow for guard/handle to avoid double-shadow overlap artifacts
  g.shadowColor = 'transparent';
  g.shadowBlur = 0;
  g.shadowOffsetX = 0;
  g.shadowOffsetY = 0;

  // 2. Guard (Crossguard - golden metallic, curved shape)
  const guardX = halfL * 0.55;
  const guardW = halfW * 2.2;
  const guardH = 6;
  const guardGrad = g.createLinearGradient(guardX - 2, 0, guardX + 4, 0);
  guardGrad.addColorStop(0, '#f59e0b');
  guardGrad.addColorStop(0.5, '#fbbf24');
  guardGrad.addColorStop(1, '#b45309');
  g.fillStyle = guardGrad;
  
  g.beginPath();
  g.moveTo(guardX - 2, -guardW / 2);
  g.quadraticCurveTo(guardX + 2, 0, guardX - 2, guardW / 2);
  g.lineTo(guardX + 4, guardW / 2);
  g.quadraticCurveTo(guardX + 4 + guardH, 0, guardX + 4, -guardW / 2);
  g.closePath();
  g.fill();
  
  g.strokeStyle = '#78350f';
  g.lineWidth = 1;
  g.stroke();

  // 3. Handle (Mahogany wood + leather wrap stripes + golden spacer rings)
  const handleStartX = guardX + 4;
  const handleEndX = halfL - 8;
  const handleW = halfW * 1.2;

  // Wood handle base
  g.fillStyle = '#451a03';
  g.fillRect(handleStartX, -handleW / 2, handleEndX - handleStartX, handleW);

  // Leather wraps (stripes)
  g.fillStyle = '#78350f';
  for (let hx = handleStartX + 4; hx < handleEndX - 4; hx += 7) {
    g.fillRect(hx, -handleW / 2, 3.5, handleW);
  }

  // Golden accent rings
  g.fillStyle = '#fbbf24';
  g.fillRect(handleStartX, -handleW / 2, 3, handleW);
  g.fillRect(handleEndX - 3, -handleW / 2, 3, handleW);

  // 4. Pommel (Round gold pommel + center rivet)
  const pommelX = halfL - 4;
  const pommelR = halfW * 0.8;
  const pommelGrad = g.createRadialGradient(pommelX, 0, 0, pommelX, 0, pommelR);
  pommelGrad.addColorStop(0, '#fbbf24');
  pommelGrad.addColorStop(1, '#92400e');
  g.fillStyle = pommelGrad;
  g.beginPath();
  g.arc(pommelX, 0, pommelR, 0, Math.PI * 2);
  g.fill();
  
  g.strokeStyle = '#78350f';
  g.lineWidth = 1;
  g.stroke();

  // Center rivet
  g.fillStyle = '#5c2c06';
  g.beginPath();
  g.arc(pommelX, 0, pommelR * 0.35, 0, Math.PI * 2);
  g.fill();

  g.restore();
}

function drawImpactFx(g: CanvasRenderingContext2D, x: number, y: number, t: number) {
  const alpha = Math.max(0, 1 - t);
  const radius = 10 + t * 26;

  g.save();
  g.globalAlpha = alpha * 0.8;
  g.strokeStyle = '#f1f5f9';
  g.lineWidth = 2.5 * (1 - t * 0.4);
  g.beginPath();
  g.arc(x, y, radius, 0, Math.PI * 2);
  g.stroke();

  g.globalAlpha = alpha * 0.5;
  const grad = g.createRadialGradient(x, y, 0, x, y, radius * 0.7);
  grad.addColorStop(0, 'rgba(226,232,240,0.9)');
  grad.addColorStop(1, 'rgba(148,163,184,0)');
  g.fillStyle = grad;
  g.beginPath();
  g.arc(x, y, radius * 0.7, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

function renderFrame(now: number) {
  if (!ctx) return;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);

  for (const knife of activeKnives.values()) {
    if (!knife.landed) {
      // While flying: pivot at center of mass
      const halfL = KNIFE_LENGTH / 2;
      const cx = knife.x + halfL * Math.cos(knife.landAngle);
      const cy = knife.y + halfL * Math.sin(knife.landAngle);
      drawKnife(ctx, cx, cy, knife.rotation, false, 0);
    } else {
      // Stuck in house: pivot at tip, penetration depth 18px
      const elapsed = now - knife.landedAt;
      const wobble = Math.sin(elapsed * 0.05) * 0.35 * Math.exp(-elapsed * 0.008);
      const drawRotation = knife.landAngle + wobble;
      
      drawKnife(ctx, knife.landX, knife.landY, drawRotation, true, 18);

      const t = Math.min(1, (now - knife.landedAt) / KNIFE_IMPACT_FX_MS);
      if (t < 1) drawImpactFx(ctx, knife.landX, knife.landY, t);
    }
  }
}

function tickFrame(now: number) {
  fxNow = now;
  if (!ctx) return;

  if (!isGameplayPaused()) {
    for (const [id, knife] of [...activeKnives.entries()]) {
      const dt = Math.min((now - knife.lastTick) / 1000, 0.033);
      knife.lastTick = now;

      if (!knife.landed) {
        knife.elapsed += dt;
        const progress = Math.min(1, knife.elapsed / knife.duration);

        knife.x = knife.startX + (knife.landX - knife.startX) * progress;
        knife.y = knife.startY + (knife.landY - knife.startY) * progress;

        // Smooth spin based on progress, ending EXACTLY at landAngle
        knife.rotation =
          knife.landAngle -
          knife.spinDirection * (knife.numSpins * 2 * Math.PI) * (1 - progress);

        if (progress >= 1) {
          knife.x = knife.landX;
          knife.y = knife.landY;
          knife.landed = true;
          knife.landedAt = now;
          knife.rotation = knife.landAngle;
          audioManager.playKnifeSlice();
          knife.onLand?.();
        }
      }

      if (knife.landed && now - knife.landedAt >= KNIFE_STUCK_DURATION_MS) {
        finishKnife(id);
      }
    }
  } else {
    for (const knife of activeKnives.values()) {
      knife.lastTick = now;
    }
  }

  renderFrame(now);
  syncTicker();
}

export function mountSoccerBallCanvas(el: HTMLCanvasElement) {
  canvas = el;
  ctx = el.getContext('2d');
}

export function unmountSoccerBallCanvas() {
  cancelAllSoccerBallKicks();
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

  renderFrame(fxNow || performance.now());
}

export function isSoccerBallCanvasReady() {
  return Boolean(ctx);
}

export function isSoccerBallCanvasSized() {
  return cssW > 0 && cssH > 0;
}

export function isSoccerBallKickActive() {
  return activeKnives.size > 0;
}

export type SoccerBallKickSpawn = {
  kickId: number;
  bounds: Rect;
  onEstateHit?: () => void;
};

export function spawnSoccerBallKick({
  kickId,
  bounds,
  onEstateHit,
}: SoccerBallKickSpawn): Promise<void> {
  if (!ctx || activeKnives.has(kickId)) return Promise.resolve();

  const spawn = computeKnifeSpawn(bounds, cssW);
  const now = performance.now();
  fxNow = now;

  const dx = spawn.landX - spawn.startX;
  const dy = spawn.landY - spawn.startY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  const speed = KNIFE_FALL_SPEED;
  const duration = dist > 0 ? dist / speed : 0.2; // flight duration in seconds
  
  const vx = dist > 0 ? (dx / dist) * speed : 0;
  const vy = dist > 0 ? (dy / dist) * speed : speed;
  const flightAngle = Math.atan2(dy, dx);
  const landAngle = flightAngle + Math.PI;

  const spinDirection = dx >= 0 ? 1 : -1;
  const numSpins = Math.max(1, Math.round(dist / KNIFE_SPIN_DIST_FACTOR)); // spin count proportional to distance

  return new Promise((resolve) => {
    activeKnives.set(kickId, {
      id: kickId,
      x: spawn.startX,
      y: spawn.startY,
      startX: spawn.startX,
      startY: spawn.startY,
      landX: spawn.landX,
      landY: spawn.landY,
      vx,
      vy,
      duration,
      elapsed: 0,
      spinDirection,
      numSpins,
      rotation: landAngle - spinDirection * (numSpins * 2 * Math.PI),
      landAngle,
      landed: false,
      landedAt: 0,
      lastTick: now,
      onLand: onEstateHit,
      resolve,
    });
    syncTicker();
    renderFrame(now);
  });
}

export function cancelSoccerBallKick(kickId: number) {
  finishKnife(kickId);
}

export function cancelAllSoccerBallKicks() {
  for (const id of [...activeKnives.keys()]) {
    finishKnife(id);
  }
  syncTicker();
  if (ctx) renderFrame(fxNow);
}
