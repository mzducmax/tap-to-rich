/**
 * Canvas2D draw routines for pig bank FX (offscreen buffer).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import {
  PIG_BANK_REWARD_LABEL,
  PIG_SPRITE_HEIGHT,
  PIG_SPRITE_WIDTH,
} from '../config/pigBankConfig';

export type PigDrawState = {
  pigX: number;
  pigY: number;
  descendProgress: number;
  pigAlpha: number;
  showRewardLabel: boolean;
  rewardLabelPop: number;
};

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

function drawPigSprite(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number,
  cy: number,
  progress: number,
  alpha: number,
) {
  const pop = easeOutCubic(Math.min(1, progress));
  const aspect = img.naturalWidth / Math.max(1, img.naturalHeight);
  let w = PIG_SPRITE_WIDTH * (0.82 + pop * 0.18);
  let h = PIG_SPRITE_HEIGHT * (0.82 + pop * 0.18);
  if (aspect > w / h) {
    h = w / aspect;
  } else {
    w = h * aspect;
  }

  const x = cx - w / 2;
  const y = cy - h / 2;

  ctx.save();
  ctx.globalAlpha = alpha;

  const glowR = Math.max(w, h) * 0.62;
  const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
  glowGrad.addColorStop(0, `rgba(250,204,21,${0.28 * pop})`);
  glowGrad.addColorStop(0.5, `rgba(250,204,21,${0.12 * pop})`);
  glowGrad.addColorStop(1, 'rgba(250,204,21,0)');
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
  ctx.fill();

  ctx.drawImage(img, x, y, w, h);
  ctx.restore();
}

function drawRewardLabel(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  pop: number,
  alpha: number,
) {
  if (pop <= 0 || alpha <= 0) return;

  const scale = 0.55 + pop * 0.45;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `900 ${Math.max(28, 44 * scale)}px system-ui,sans-serif`;
  ctx.textAlign = 'center';
  const labelY = cy - 120 * scale;

  ctx.lineWidth = (3.5 + 7) * scale;
  ctx.strokeStyle = 'rgba(250,204,21,0.42)';
  ctx.strokeText(PIG_BANK_REWARD_LABEL, cx, labelY);
  ctx.lineWidth = 3.5 * scale;
  ctx.strokeStyle = '#14532d';
  ctx.strokeText(PIG_BANK_REWARD_LABEL, cx, labelY);
  ctx.fillStyle = '#fbbf24';
  ctx.fillText(PIG_BANK_REWARD_LABEL, cx, labelY);
  ctx.restore();
}

export function drawPigBankFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dpr: number,
  pigImg: HTMLImageElement,
  state: PigDrawState,
) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  if (state.pigAlpha <= 0) return;

  ctx.save();
  ctx.globalAlpha = state.pigAlpha;

  // Money bills are now rendered on a GPU sprite layer (see pigBankPixiCanvas).
  if (state.descendProgress > 0 && pigImg.complete && pigImg.naturalWidth > 0) {
    drawPigSprite(ctx, pigImg, state.pigX, state.pigY, state.descendProgress, state.pigAlpha);
  }

  if (state.showRewardLabel) {
    drawRewardLabel(ctx, width * 0.5, height * 0.42, state.rewardLabelPop, state.pigAlpha);
  }

  ctx.restore();
}
