/**
 * Pre-baked veggie bitmaps (tomato / banana / cabbage) — one drawImage per projectile per frame.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { TOMATO_SIZE } from '../config/tomatoConfig';

export type VeggieVariant = 'tomato' | 'banana' | 'cabbage';

export const VEGGIE_VARIANTS: readonly VeggieVariant[] = ['tomato', 'banana', 'cabbage'];

const sprites = new Map<VeggieVariant, HTMLCanvasElement>();

function drawTomato(ctx: CanvasRenderingContext2D, size: number) {
  const cx = size * 0.5;
  const cy = size * 0.54;
  const r = size * 0.38;

  ctx.save();
  ctx.translate(cx, cy);

  // Round tomato body.
  const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r * 1.15);
  grad.addColorStop(0, '#ff8a6b');
  grad.addColorStop(0.4, '#f5402a');
  grad.addColorStop(0.8, '#d31f16');
  grad.addColorStop(1, '#9b1109');

  ctx.beginPath();
  ctx.ellipse(0, r * 0.05, r * 1.02, r * 0.94, 0, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.strokeStyle = 'rgba(120, 12, 6, 0.5)';
  ctx.lineWidth = size * 0.03;
  ctx.stroke();

  // Glossy highlight.
  ctx.globalCompositeOperation = 'source-atop';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.32, -r * 0.4, r * 0.24, r * 0.14, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';

  // Green calyx / star leaves on top.
  ctx.fillStyle = '#2f8f3a';
  ctx.strokeStyle = '#1c6a26';
  ctx.lineWidth = size * 0.012;
  const leaves = 5;
  const topY = -r * 0.86;
  for (let i = 0; i < leaves; i += 1) {
    const ang = (i / leaves) * Math.PI * 2 - Math.PI / 2;
    ctx.save();
    ctx.translate(0, topY);
    ctx.rotate(ang);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(r * 0.18, r * 0.1, r * 0.42, r * 0.02);
    ctx.quadraticCurveTo(r * 0.2, r * 0.16, 0, r * 0.24);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Little stem.
  ctx.fillStyle = '#2f8f3a';
  ctx.beginPath();
  ctx.ellipse(0, topY - r * 0.06, r * 0.08, r * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawBanana(ctx: CanvasRenderingContext2D, size: number) {
  const cx = size * 0.5;
  const cy = size * 0.5;
  const r = size * 0.42;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.35);

  // Crescent body — outer belly bows further than the inner edge.
  const tipL = { x: -r * 0.92, y: -r * 0.42 };
  const tipR = { x: r * 0.92, y: -r * 0.42 };
  const grad = ctx.createLinearGradient(0, -r * 0.4, 0, r * 0.9);
  grad.addColorStop(0, '#ffe680');
  grad.addColorStop(0.45, '#ffd23f');
  grad.addColorStop(1, '#e8a814');

  ctx.beginPath();
  ctx.moveTo(tipL.x, tipL.y);
  ctx.quadraticCurveTo(0, r * 1.15, tipR.x, tipR.y);
  ctx.quadraticCurveTo(0, r * 0.32, tipL.x, tipL.y);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(160, 110, 10, 0.55)';
  ctx.lineWidth = size * 0.028;
  ctx.stroke();

  // Ridge line along the belly.
  ctx.beginPath();
  ctx.moveTo(tipL.x * 0.82, tipL.y * 0.55);
  ctx.quadraticCurveTo(0, r * 0.85, tipR.x * 0.82, tipR.y * 0.55);
  ctx.strokeStyle = 'rgba(200, 150, 30, 0.6)';
  ctx.lineWidth = size * 0.02;
  ctx.stroke();

  // Brown tips.
  ctx.fillStyle = '#7a4a12';
  ctx.beginPath();
  ctx.ellipse(tipL.x, tipL.y, r * 0.09, r * 0.13, -0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(tipR.x, tipR.y, r * 0.09, r * 0.13, 0.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawCabbage(ctx: CanvasRenderingContext2D, size: number) {
  const cx = size * 0.5;
  const cy = size * 0.52;
  const r = size * 0.4;

  ctx.save();
  ctx.translate(cx, cy);

  // Round head.
  const grad = ctx.createRadialGradient(-r * 0.25, -r * 0.3, r * 0.1, 0, 0, r * 1.12);
  grad.addColorStop(0, '#d9f2a8');
  grad.addColorStop(0.45, '#9fd45e');
  grad.addColorStop(0.85, '#5f9e33');
  grad.addColorStop(1, '#3f7a20');

  ctx.beginPath();
  ctx.ellipse(0, 0, r * 1.02, r * 0.96, 0, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(46, 94, 20, 0.55)';
  ctx.lineWidth = size * 0.03;
  ctx.stroke();

  // Wrapping outer leaves — arcs hugging the sides.
  ctx.strokeStyle = 'rgba(66, 128, 30, 0.75)';
  ctx.lineWidth = size * 0.022;
  ctx.beginPath();
  ctx.moveTo(-r * 0.85, -r * 0.2);
  ctx.quadraticCurveTo(-r * 0.35, r * 0.55, r * 0.15, r * 0.85);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(r * 0.85, -r * 0.2);
  ctx.quadraticCurveTo(r * 0.35, r * 0.55, -r * 0.15, r * 0.85);
  ctx.stroke();

  // Leaf veins fanning from the top.
  ctx.strokeStyle = 'rgba(226, 245, 190, 0.8)';
  ctx.lineWidth = size * 0.018;
  for (const dir of [-0.55, 0, 0.55]) {
    ctx.beginPath();
    ctx.moveTo(dir * r * 0.2, -r * 0.9);
    ctx.quadraticCurveTo(dir * r * 0.75, -r * 0.15, dir * r * 0.55, r * 0.6);
    ctx.stroke();
  }

  ctx.restore();
}

export function getVeggieSprite(variant: VeggieVariant): HTMLCanvasElement | null {
  const cached = sprites.get(variant);
  if (cached) return cached;

  const size = TOMATO_SIZE;
  const off = document.createElement('canvas');
  off.width = size;
  off.height = size;
  const ctx = off.getContext('2d');
  if (!ctx) return null;

  if (variant === 'banana') drawBanana(ctx, size);
  else if (variant === 'cabbage') drawCabbage(ctx, size);
  else drawTomato(ctx, size);

  sprites.set(variant, off);
  return off;
}

export function prewarmTomatoSprite() {
  for (const variant of VEGGIE_VARIANTS) {
    getVeggieSprite(variant);
  }
}
