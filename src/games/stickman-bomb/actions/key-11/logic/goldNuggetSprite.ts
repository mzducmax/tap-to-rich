/**
 * Pre-baked gold nugget bitmap — one drawImage per nugget per frame.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { BUTTERFLY_SIZE } from '../config/butterflyConfig';

let sprite: HTMLCanvasElement | null = null;

export function getGoldNuggetSprite(): HTMLCanvasElement | null {
  if (sprite) return sprite;

  const size = BUTTERFLY_SIZE;
  const off = document.createElement('canvas');
  off.width = size;
  off.height = size;
  const ctx = off.getContext('2d');
  if (!ctx) return null;

  const cx = size * 0.5;
  const cy = size * 0.52;
  const r = size * 0.38;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.18);

  const body = new Path2D();
  body.moveTo(-r * 0.55, -r * 0.35);
  body.bezierCurveTo(-r * 1.05, -r * 0.75, -r * 0.35, -r * 1.05, r * 0.15, -r * 0.82);
  body.bezierCurveTo(r * 0.95, -r * 0.95, r * 1.05, -r * 0.1, r * 0.72, r * 0.35);
  body.bezierCurveTo(r * 1.02, r * 0.82, r * 0.2, r * 1.02, -r * 0.2, r * 0.88);
  body.bezierCurveTo(-r * 0.82, r * 0.95, -r * 1.02, r * 0.2, -r * 0.55, -r * 0.35);
  body.closePath();

  const grad = ctx.createRadialGradient(-r * 0.25, -r * 0.35, r * 0.08, 0, 0, r * 1.1);
  grad.addColorStop(0, '#fff7c2');
  grad.addColorStop(0.35, '#fde047');
  grad.addColorStop(0.72, '#f59e0b');
  grad.addColorStop(1, '#b45309');

  ctx.fillStyle = grad;
  ctx.fill(body);

  ctx.strokeStyle = 'rgba(120, 53, 15, 0.55)';
  ctx.lineWidth = size * 0.035;
  ctx.stroke(body);

  ctx.globalCompositeOperation = 'source-atop';
  const shine = ctx.createLinearGradient(-r, -r, r * 0.4, r * 0.5);
  shine.addColorStop(0, 'rgba(255,255,255,0.72)');
  shine.addColorStop(0.45, 'rgba(255,255,255,0.08)');
  shine.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = shine;
  ctx.fillRect(-r * 1.1, -r * 1.1, r * 2.2, r * 2.2);

  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = 'rgba(255, 251, 235, 0.85)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.28, -r * 0.42, r * 0.14, r * 0.08, -0.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
  sprite = off;
  return sprite;
}

export function prewarmGoldNuggetSprite() {
  getGoldNuggetSprite();
}
