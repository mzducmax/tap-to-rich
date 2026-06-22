/**
 * Pre-baked "+reward$" popup — one drawImage per float, no per-frame text/layout.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export type LandFloatSprite = {
  canvas: HTMLCanvasElement;
  cssW: number;
  cssH: number;
};

let cachedLabel = '';
let cachedSprite: LandFloatSprite | null = null;

export function bakeLandFloatSprite(label: string): LandFloatSprite {
  if (cachedSprite && cachedLabel === label) return cachedSprite;

  const fontSize = 24;
  const font = `900 ${fontSize}px "Arial Black", system-ui, sans-serif`;
  const padX = 30;
  const padY = 18;

  const probe = document.createElement('canvas');
  const probeCtx = probe.getContext('2d');
  if (!probeCtx) {
    cachedLabel = label;
    cachedSprite = { canvas: probe, cssW: 80, cssH: 40 };
    return cachedSprite;
  }

  probeCtx.font = font;
  const textW = probeCtx.measureText(label).width;
  const cssW = Math.ceil(textW + padX * 2);
  const cssH = fontSize + padY * 2;

  const canvas = document.createElement('canvas');
  canvas.width = cssW;
  canvas.height = cssH;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    cachedLabel = label;
    cachedSprite = { canvas, cssW, cssH };
    return cachedSprite;
  }

  const cx = cssW * 0.5;
  const cy = cssH * 0.5;

  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, cssW * 0.58);
  glow.addColorStop(0, 'rgba(52,211,153,0.62)');
  glow.addColorStop(0.42, 'rgba(52,211,153,0.24)');
  glow.addColorStop(1, 'rgba(52,211,153,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, cssW, cssH);

  const shimmer = ctx.createRadialGradient(cx - 10, cy - 6, 0, cx, cy, cssW * 0.36);
  shimmer.addColorStop(0, 'rgba(253,224,71,0.5)');
  shimmer.addColorStop(0.55, 'rgba(250,204,21,0.12)');
  shimmer.addColorStop(1, 'rgba(250,204,21,0)');
  ctx.fillStyle = shimmer;
  ctx.fillRect(0, 0, cssW, cssH);

  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';

  ctx.lineWidth = 5.5;
  ctx.strokeStyle = '#064e3b';
  ctx.strokeText(label, cx, cy);

  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255,255,255,0.38)';
  ctx.strokeText(label, cx, cy + 0.6);

  const fillGrad = ctx.createLinearGradient(cx - cssW * 0.28, cy - fontSize * 0.55, cx + cssW * 0.28, cy + fontSize * 0.55);
  fillGrad.addColorStop(0, '#a7f3d0');
  fillGrad.addColorStop(0.28, '#34d399');
  fillGrad.addColorStop(0.62, '#fde047');
  fillGrad.addColorStop(1, '#fbbf24');
  ctx.fillStyle = fillGrad;
  ctx.fillText(label, cx, cy);

  ctx.fillStyle = 'rgba(255,255,255,0.42)';
  ctx.fillText(label, cx, cy - 1.2);

  cachedLabel = label;
  cachedSprite = { canvas, cssW, cssH };
  return cachedSprite;
}

export function getLandFloatEase(t: number) {
  const clamped = Math.max(0, Math.min(1, t));
  const rise = 1 - Math.pow(1 - clamped, 2.15);

  let scale: number;
  if (clamped < 0.12) {
    const p = clamped / 0.12;
    scale = 0.44 + p * 0.72;
  } else if (clamped < 0.3) {
    const p = (clamped - 0.12) / 0.18;
    scale = 1.16 + p * 0.16;
  } else {
    const p = (clamped - 0.3) / 0.7;
    scale = 1.32 - p * 0.4;
  }

  let alpha: number;
  if (clamped < 0.07) alpha = clamped / 0.07;
  else if (clamped < 0.55) alpha = 1;
  else alpha = 1 - (clamped - 0.55) / 0.45;

  return { rise, scale, alpha: Math.max(0, alpha) };
}

export function drawBakedLandFloat(
  ctx: CanvasRenderingContext2D,
  sprite: LandFloatSprite,
  x: number,
  y: number,
  rise: number,
  scale: number,
  alpha: number,
) {
  const drawW = sprite.cssW * scale;
  const drawH = sprite.cssH * scale;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y - rise);
  ctx.drawImage(sprite.canvas, -drawW * 0.5, -drawH * 0.5, drawW, drawH);
  ctx.restore();
}
