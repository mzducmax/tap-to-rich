/**
 * Full-width stock-floor chart — baked grid + precomputed path (key 9).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import {
  TRUMP_REWARD_LABEL,
  TRUMP_STOCK_GRID_LINES,
  TRUMP_STOCK_PATH_SEGMENTS,
} from '../config/trumpSpawnConfig';

let cachedW = 0;
let cachedH = 0;
let pathX: Float32Array | null = null;
let pathY: Float32Array | null = null;
let gridCanvas: HTMLCanvasElement | null = null;
let bandTop = 0;
let bandBottom = 0;

function buildBullishPath(width: number, height: number) {
  const n = TRUMP_STOCK_PATH_SEGMENTS;
  pathX = new Float32Array(n + 1);
  pathY = new Float32Array(n + 1);

  bandTop = height * 0.48;
  bandBottom = height * 0.94;
  const bandH = bandBottom - bandTop;
  const seed = width * 0.017 + height * 0.013;

  let y = bandBottom - bandH * 0.12;
  for (let i = 0; i <= n; i += 1) {
    const t = i / n;
    pathX[i] = t * width;
    const target = bandTop + bandH * (0.58 - t * 0.52);
    const wave =
      Math.sin(t * 9.5 + seed) * bandH * 0.06 +
      Math.sin(t * 21 + seed * 1.7) * bandH * 0.025;
    y += (target + wave - y) * 0.38;
    pathY[i] = y;
  }
}

function buildGridLayer(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    gridCanvas = canvas;
    return;
  }

  bandTop = height * 0.48;
  bandBottom = height * 0.94;

  ctx.fillStyle = 'rgba(2,18,12,0.52)';
  ctx.fillRect(0, bandTop, width, bandBottom - bandTop);

  const gridH = bandBottom - bandTop;
  for (let i = 0; i <= TRUMP_STOCK_GRID_LINES; i += 1) {
    const gy = bandTop + (gridH * i) / TRUMP_STOCK_GRID_LINES;
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(34,197,94,0.16)' : 'rgba(34,197,94,0.08)';
    ctx.lineWidth = i % 2 === 0 ? 1 : 0.5;
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(width, gy);
    ctx.stroke();
  }

  const vertStep = width / 10;
  for (let x = 0; x <= width; x += vertStep) {
    ctx.strokeStyle = 'rgba(34,197,94,0.06)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x, bandTop);
    ctx.lineTo(x, bandBottom);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(34,197,94,0.92)';
  ctx.font = 'bold 13px ui-monospace, monospace';
  ctx.textAlign = 'left';
  ctx.fillText(TRUMP_REWARD_LABEL, 12, bandTop + 18);
  ctx.fillStyle = 'rgba(250,204,21,0.85)';
  ctx.fillText('▲ BULL RUN', 12, bandTop + 34);

  gridCanvas = canvas;
}

export function resizeTrumpStockFloor(width: number, height: number) {
  if (width <= 0 || height <= 0) return;
  if (width === cachedW && height === cachedH) return;
  cachedW = width;
  cachedH = height;
  buildBullishPath(width, height);
  buildGridLayer(width, height);
}

export function clearTrumpStockFloorCache() {
  cachedW = 0;
  cachedH = 0;
  pathX = null;
  pathY = null;
  gridCanvas = null;
}

function traceChartPath(
  ctx: CanvasRenderingContext2D,
  endIndex: number,
  closeBottom: boolean,
) {
  if (!pathX || !pathY || endIndex < 1) return;

  ctx.moveTo(pathX[0]!, pathY[0]!);
  for (let i = 1; i <= endIndex; i += 1) {
    ctx.lineTo(pathX[i]!, pathY[i]!);
  }

  if (closeBottom) {
    ctx.lineTo(pathX[endIndex]!, bandBottom);
    ctx.lineTo(pathX[0]!, bandBottom);
    ctx.closePath();
  }
}

/** progress 0..1 — chart reveals left → right. */
export function drawTrumpStockFloor(
  ctx: CanvasRenderingContext2D,
  progress: number,
  alpha: number,
  now: number,
) {
  if (!pathX || !pathY || !gridCanvas || cachedW <= 0) return;
  if (progress <= 0 || alpha <= 0) return;

  const p = Math.min(1, Math.max(0, progress));
  const n = pathX.length - 1;
  const floatIdx = p * n;
  const endIndex = Math.min(n, Math.max(1, Math.floor(floatIdx)));
  const tipT = floatIdx - Math.floor(floatIdx);

  ctx.save();
  ctx.globalAlpha = alpha;

  ctx.drawImage(gridCanvas, 0, 0);

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, bandTop, cachedW * p + 2, bandBottom - bandTop);
  ctx.clip();

  ctx.beginPath();
  traceChartPath(ctx, endIndex, true);
  const fillGrad = ctx.createLinearGradient(0, bandTop, 0, bandBottom);
  fillGrad.addColorStop(0, 'rgba(74,222,128,0.38)');
  fillGrad.addColorStop(0.55, 'rgba(34,197,94,0.22)');
  fillGrad.addColorStop(1, 'rgba(22,163,74,0.04)');
  ctx.fillStyle = fillGrad;
  ctx.fill();

  ctx.beginPath();
  traceChartPath(ctx, endIndex, false);
  ctx.strokeStyle = '#4ade80';
  ctx.lineWidth = 2.8;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();

  ctx.beginPath();
  traceChartPath(ctx, endIndex, false);
  ctx.strokeStyle = 'rgba(254,240,138,0.55)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.restore();

  const tipX =
    pathX[endIndex - 1]! +
    (pathX[endIndex]! - pathX[endIndex - 1]!) * Math.min(1, tipT + 0.001);
  const tipY =
    pathY[endIndex - 1]! +
    (pathY[endIndex]! - pathY[endIndex - 1]!) * Math.min(1, tipT + 0.001);
  const pulse = 0.88 + Math.sin(now * 0.022) * 0.12;

  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(tipX, tipY, 5 * pulse, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(74,222,128,0.85)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  ctx.moveTo(tipX, bandTop);
  ctx.lineTo(tipX, bandBottom);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.restore();
}
