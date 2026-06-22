/**
 * Pre-baked dollar coin sprite — drawImage per particle, no per-frame gradients.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const TRUMP_COIN_SPRITE_SIZE = 64;

let coinCanvas: HTMLCanvasElement | null = null;

function ensureCoinSprite() {
  if (coinCanvas) return coinCanvas;

  const size = TRUMP_COIN_SPRITE_SIZE;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    coinCanvas = canvas;
    return canvas;
  }

  const r = size * 0.44;
  const cx = size / 2;
  const cy = size / 2;

  const body = ctx.createRadialGradient(cx - r * 0.22, cy - r * 0.28, 0, cx, cy, r);
  body.addColorStop(0, '#fffef5');
  body.addColorStop(0.28, '#fef08a');
  body.addColorStop(0.58, '#fbbf24');
  body.addColorStop(0.82, '#f59e0b');
  body.addColorStop(1, '#b45309');

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = body;
  ctx.fill();

  ctx.lineWidth = size * 0.06;
  ctx.strokeStyle = '#fff7cc';
  ctx.stroke();

  ctx.lineWidth = size * 0.035;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.76, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(146,64,14,0.5)';
  ctx.stroke();

  ctx.fillStyle = '#78350f';
  ctx.font = `900 ${r * 1.05}px system-ui,sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('$', cx, cy + r * 0.04);

  const spec = ctx.createRadialGradient(cx - r * 0.32, cy - r * 0.34, 0, cx - r * 0.1, cy - r * 0.12, r * 0.55);
  spec.addColorStop(0, 'rgba(255,255,255,0.98)');
  spec.addColorStop(0.45, 'rgba(255,251,235,0.35)');
  spec.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = spec;
  ctx.beginPath();
  ctx.arc(cx - r * 0.12, cy - r * 0.14, r * 0.52, 0, Math.PI * 2);
  ctx.fill();

  coinCanvas = canvas;
  return canvas;
}

export function drawBakedDollarCoin(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  rotation: number,
  alpha: number,
) {
  const sprite = ensureCoinSprite();

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.drawImage(
    sprite,
    -radius,
    -radius,
    radius * 2,
    radius * 2,
  );
  ctx.restore();
}

export function drawTrumpGoldenFlash(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  alpha: number,
) {
  const radius = 90 * (0.28 + t * 1.12);
  ctx.save();
  ctx.globalAlpha = alpha * 0.72 * (1 - t);
  const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
  grad.addColorStop(0, 'rgba(255,255,240,1)');
  grad.addColorStop(0.25, 'rgba(253,224,71,0.88)');
  grad.addColorStop(0.55, 'rgba(245,158,11,0.35)');
  grad.addColorStop(1, 'rgba(245,158,11,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawTrumpGoldenRing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  alpha: number,
  size: number,
) {
  const radius = size * (0.22 + t * 1.22);
  ctx.save();
  ctx.globalAlpha = alpha * 0.95 * (1 - t * 0.5);
  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 5 * (1 - t * 0.28);
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
