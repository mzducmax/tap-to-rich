/**
 * Canvas2D draw routines for Trump spawn FX (offscreen buffer).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import {
  TRUMP_LINE_WIDTH,
  TRUMP_REWARD_LABEL,
  TRUMP_SPRITE_HEIGHT,
  TRUMP_SPRITE_WIDTH,
} from '../config/trumpSpawnConfig';
import { drawTrumpCoinBurst } from './trumpCoinBurst';
import { drawTrumpMoneyRain } from './trumpMoneyRain';
import { drawTrumpStockFloor } from './trumpStockFloor';
import { samplePathProgress, type Point2 } from './trumpSpawnPath';

export type TrumpDrawState = {
  boxX: number;
  boxY: number;
  boxPop: number;
  linePoints: Point2[];
  lineProgress: number;
  lineSeed: number;
  stockProgress: number;
  burstStarted: boolean;
  trumpAlpha: number;
};

function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
}

function drawTrumpSprite(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number,
  cy: number,
  pop: number,
) {
  const popScale = easeOutBack(Math.min(1, pop));
  const aspect = img.naturalWidth / Math.max(1, img.naturalHeight);
  let w = TRUMP_SPRITE_WIDTH * popScale;
  let h = TRUMP_SPRITE_HEIGHT * popScale;
  if (aspect > w / h) {
    h = w / aspect;
  } else {
    w = h * aspect;
  }

  const x = cx - w / 2;
  const y = cy - h / 2;

  ctx.save();

  // Sprite glow — radial gradient behind the image (no shadowBlur GPU pass).
  const glowR = Math.max(w, h) * 0.7;
  const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
  glowGrad.addColorStop(0, `rgba(250,204,21,${0.32 * popScale})`);
  glowGrad.addColorStop(0.45, `rgba(250,204,21,${0.14 * popScale})`);
  glowGrad.addColorStop(1, 'rgba(250,204,21,0)');
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
  ctx.fill();

  ctx.drawImage(img, x, y, w, h);

  // Label — double-stroke for glow (no shadowBlur).
  ctx.font = `900 ${Math.max(20, 28 * popScale)}px system-ui,sans-serif`;
  ctx.textAlign = 'center';
  const labelY = y + h + 22 * popScale;
  // Outer glow stroke
  ctx.lineWidth = (3.5 + 6) * popScale;
  ctx.strokeStyle = 'rgba(250,204,21,0.38)';
  ctx.strokeText(TRUMP_REWARD_LABEL, cx, labelY);
  // Inner outline stroke
  ctx.lineWidth = 3.5 * popScale;
  ctx.strokeStyle = '#1e3a8a';
  ctx.strokeText(TRUMP_REWARD_LABEL, cx, labelY);
  ctx.fillStyle = '#fbbf24';
  ctx.fillText(TRUMP_REWARD_LABEL, cx, labelY);

  ctx.restore();
}

function drawMoneyLine(
  ctx: CanvasRenderingContext2D,
  points: Point2[],
  progress: number,
  now: number,
) {
  const visible = samplePathProgress(points, progress);
  if (visible.length < 2) return;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = TRUMP_LINE_WIDTH;

  const grad = ctx.createLinearGradient(
    visible[0]!.x,
    visible[visible.length - 1]!.y,
    visible[visible.length - 1]!.x,
    visible[0]!.y,
  );
  grad.addColorStop(0, '#22c55e');
  grad.addColorStop(0.5, '#facc15');
  grad.addColorStop(1, '#ef4444');
  // Glow pass — wider stroke at low alpha (replaces shadowBlur).
  ctx.lineWidth = TRUMP_LINE_WIDTH * 3.2;
  ctx.strokeStyle = 'rgba(250,204,21,0.22)';
  ctx.beginPath();
  ctx.moveTo(visible[0]!.x, visible[0]!.y);
  for (let i = 1; i < visible.length; i++) {
    ctx.lineTo(visible[i]!.x, visible[i]!.y);
  }
  ctx.stroke();

  // Core stroke.
  ctx.lineWidth = TRUMP_LINE_WIDTH;
  ctx.strokeStyle = grad;
  ctx.beginPath();
  ctx.moveTo(visible[0]!.x, visible[0]!.y);
  for (let i = 1; i < visible.length; i++) {
    ctx.lineTo(visible[i]!.x, visible[i]!.y);
  }
  ctx.stroke();

  const tip = visible[visible.length - 1]!;
  const pulse = 0.85 + Math.sin(now * 0.018) * 0.15;
  ctx.beginPath();
  ctx.arc(tip.x, tip.y, 9 * pulse, 0, Math.PI * 2);
  ctx.fillStyle = '#fef08a';
  ctx.fill();
  ctx.restore();
}

export function drawTrumpSpawnFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dpr: number,
  trumpImg: HTMLImageElement,
  dollarTrumpImg: HTMLImageElement,
  state: TrumpDrawState,
  now: number,
) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  if (state.trumpAlpha <= 0) return;

  ctx.save();
  ctx.globalAlpha = state.trumpAlpha;

  if (state.stockProgress > 0) {
    drawTrumpStockFloor(ctx, state.stockProgress, state.trumpAlpha, now);
  }

  if (state.burstStarted) {
    drawTrumpCoinBurst(ctx, now, state.trumpAlpha);
  }

  drawTrumpMoneyRain(ctx, dollarTrumpImg, state.trumpAlpha);

  if (state.lineProgress > 0) {
    drawMoneyLine(ctx, state.linePoints, state.lineProgress, now);
  }

  if (state.boxPop > 0 && trumpImg.complete && trumpImg.naturalWidth > 0) {
    drawTrumpSprite(ctx, trumpImg, state.boxX, state.boxY, state.boxPop);
  }

  ctx.restore();
}
