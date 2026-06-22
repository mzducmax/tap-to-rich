/**
 * Shared Canvas2D draw routines for vertical lightning (identical visuals).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import type { Point2 } from '../../shared/animationUtils';
import type { BoltGeometry } from './verticalLightningPath';

export type VerticalBoltDrawState = {
  geometry: BoltGeometry;
  tipX: number;
  tipY: number;
  cloudX: number;
  startY: number;
  startTime: number;
  duration: number;
  seed: number;
  struck: boolean;
};

const sliceScratch: Point2[] = [];

function slicePathByProgress(points: Point2[], progress: number): Point2[] {
  sliceScratch.length = 0;
  if (points.length < 2) {
    sliceScratch.push(...points);
    return sliceScratch;
  }
  const totalSeg = points.length - 1;
  const floatIdx = progress * totalSeg;
  const baseIdx = Math.floor(floatIdx);
  const frac = floatIdx - baseIdx;
  if (baseIdx >= totalSeg) {
    sliceScratch.push(...points);
    return sliceScratch;
  }
  for (let i = 0; i <= baseIdx; i += 1) {
    sliceScratch.push(points[i]!);
  }
  const a = points[baseIdx]!;
  const b = points[baseIdx + 1]!;
  sliceScratch.push({
    x: a.x + (b.x - a.x) * frac,
    y: a.y + (b.y - a.y) * frac,
  });
  return sliceScratch;
}

function strokePath(
  context: CanvasRenderingContext2D,
  points: Point2[],
  lineWidth: number,
  color: string,
) {
  if (points.length < 2) return;
  context.beginPath();
  context.moveTo(points[0]!.x, points[0]!.y);
  for (let i = 1; i < points.length; i += 1) {
    context.lineTo(points[i]!.x, points[i]!.y);
  }
  context.strokeStyle = color;
  context.lineWidth = lineWidth;
  context.stroke();
}

function drawBoltGeometry(
  context: CanvasRenderingContext2D,
  geometry: BoltGeometry,
  progress: number,
  alpha: number,
) {
  const main = slicePathByProgress(geometry.main, progress);
  if (main.length < 2) return;

  context.save();
  context.globalCompositeOperation = 'lighter';
  context.lineCap = 'round';
  context.lineJoin = 'round';

  // Main bolt — 4 passes (no shadowBlur): outer plasma → inner glow → cyan midtone → white-hot core
  strokePath(context, main, 30, `rgba(28, 12, 148, ${alpha * 0.18})`);
  strokePath(context, main, 14, `rgba(98, 62, 252, ${alpha * 0.44})`);
  strokePath(context, main,  6, `rgba(162, 212, 255, ${alpha * 0.68})`);
  strokePath(context, main,  2.4, `rgba(255, 252, 240, ${alpha * 0.96})`);

  // Branches — 3 passes each (no shadowBlur)
  for (const branch of geometry.branches) {
    const seg = slicePathByProgress(branch, Math.min(1, progress * 1.08));
    if (seg.length < 2) continue;
    strokePath(context, seg, 18, `rgba(34, 16, 128, ${alpha * 0.15})`);
    strokePath(context, seg,  7, `rgba(88, 58, 208, ${alpha * 0.36})`);
    strokePath(context, seg,  2, `rgba(198, 192, 255, ${alpha * 0.64})`);
  }

  context.restore();
}

function drawSkyFlash(context: CanvasRenderingContext2D, x: number, y: number, alpha: number) {
  if (alpha < 0.04) return;
  const g = context.createRadialGradient(x, y, 0, x, y, 72);
  g.addColorStop(0, `rgba(255, 250, 235, ${alpha * 0.75})`);
  g.addColorStop(0.35, `rgba(180, 150, 255, ${alpha * 0.35})`);
  g.addColorStop(1, 'rgba(80, 60, 160, 0)');
  context.save();
  context.globalCompositeOperation = 'lighter';
  context.fillStyle = g;
  context.beginPath();
  context.arc(x, y, 72, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

const TWO_PI = Math.PI * 2;

function drawGroundFlash(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  alpha: number,
  seed: number,
) {
  if (alpha < 0.04) return;
  context.save();
  context.globalCompositeOperation = 'lighter';

  // Core radial glow — no shadowBlur, no context.filter
  const core = context.createRadialGradient(x, y, 0, x, y, 68);
  core.addColorStop(0, `rgba(255, 255, 252, ${alpha})`);
  core.addColorStop(0.14, `rgba(195, 220, 255, ${alpha * 0.88})`);
  core.addColorStop(0.44, `rgba(108, 82, 232, ${alpha * 0.44})`);
  core.addColorStop(1, 'rgba(38, 28, 98, 0)');
  context.fillStyle = core;
  context.beginPath();
  context.arc(x, y, 68, 0, TWO_PI);
  context.fill();

  // Starburst crackle spokes — seed-derived for frame-stable positions
  context.lineCap = 'round';
  const baseAng = seed * TWO_PI;
  const SPOKES = 6;
  for (let k = 0; k < SPOKES; k += 1) {
    const ang = baseAng + (k / SPOKES) * TWO_PI;
    const len = 36 + ((seed * 7.3 + k * 2.85) % 1) * 34;
    context.lineWidth = 1.6 + ((seed * 3.2 + k * 1.3) % 1) * 1.8;
    context.strokeStyle = `rgba(215, 232, 255, ${alpha * 0.70})`;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
    context.stroke();
  }
  // Thin secondary micro-spokes
  for (let k = 0; k < SPOKES; k += 1) {
    const ang = baseAng + ((k + 0.5) / SPOKES) * TWO_PI;
    const len = 18 + ((seed * 5.1 + k * 1.65) % 1) * 16;
    context.lineWidth = 0.9;
    context.strokeStyle = `rgba(180, 200, 255, ${alpha * 0.44})`;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
    context.stroke();
  }

  context.restore();
}

function boltEnvelope(raw: number): number {
  if (raw < 0.06) return raw / 0.06;
  if (raw < 0.45) return 1;
  return Math.max(0, 1 - (raw - 0.45) / 0.55);
}

function boltFlicker(raw: number, seed: number): number {
  const wave = Math.sin((raw * 14 + seed) * Math.PI * 2) * 0.5 + 0.5;
  const crackle = Math.sin((raw * 31 + seed * 1.7) * Math.PI * 2) * 0.5 + 0.5;
  return 0.5 + wave * 0.32 + crackle * 0.18;
}

/** Draw one frame; returns indices of bolts that should fire onStrike this frame. */
export function drawVerticalLightningFrame(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  dpr: number,
  bolts: VerticalBoltDrawState[],
  now: number,
): number[] {
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, width, height);

  const strikeIndices: number[] = [];

  for (let i = 0; i < bolts.length; i += 1) {
    const bolt = bolts[i]!;
    const raw = Math.min((now - bolt.startTime) / bolt.duration, 1);
    const envelope = boltEnvelope(raw);
    const alpha = envelope * boltFlicker(raw, bolt.seed);
    const progress = Math.min(1, 0.55 + raw * 0.45);

    drawBoltGeometry(context, bolt.geometry, progress, alpha);
    drawSkyFlash(context, bolt.cloudX, bolt.startY + 8, alpha * (1 - raw * 0.5));

    if (!bolt.struck && raw >= 0.42 && raw <= 0.55) {
      strikeIndices.push(i);
    }

    if (bolt.struck) {
      const strikeAge = Math.max(0, raw - 0.48);
      const flashAlpha = Math.max(0, 1 - strikeAge * 5) * envelope;
      drawGroundFlash(context, bolt.tipX, bolt.tipY, flashAlpha, bolt.seed);
    }
  }

  return strikeIndices;
}

export function boltAnimationRaw(bolt: VerticalBoltDrawState, now: number): number {
  return Math.min((now - bolt.startTime) / bolt.duration, 1);
}
