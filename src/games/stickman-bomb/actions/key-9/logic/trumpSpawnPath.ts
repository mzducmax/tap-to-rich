/**
 * Zigzag money line path from screen bottom to Trump box.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { TRUMP_LINE_SEGMENTS } from '../config/trumpSpawnConfig';

export type Point2 = { x: number; y: number };

export function buildTrumpMoneyPath(
  start: Point2,
  end: Point2,
  amplitude: number,
  seed = 0,
): Point2[] {
  const points: Point2[] = [start];
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;

  for (let i = 1; i <= TRUMP_LINE_SEGMENTS; i++) {
    const t = i / TRUMP_LINE_SEGMENTS;
    const baseX = start.x + dx * t;
    const baseY = start.y + dy * t;
    const wave = Math.sin(t * Math.PI * 3.2 + seed * 1.7) * amplitude;
    const taper = Math.sin(t * Math.PI);
    points.push({
      x: baseX + nx * wave * taper,
      y: baseY + ny * wave * taper * 0.35,
    });
  }

  points.push(end);
  return points;
}

/** Sample polyline length up to progress [0..1]. */
export function samplePathProgress(points: Point2[], progress: number): Point2[] {
  if (points.length < 2 || progress <= 0) return [points[0]!];
  if (progress >= 1) return points;

  const segLens: number[] = [];
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!;
    const b = points[i]!;
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    segLens.push(len);
    total += len;
  }

  const target = total * progress;
  let walked = 0;
  const result: Point2[] = [points[0]!];

  for (let i = 0; i < segLens.length; i++) {
    const seg = segLens[i]!;
    if (walked + seg >= target) {
      const localT = seg > 0 ? (target - walked) / seg : 0;
      const a = points[i]!;
      const b = points[i + 1]!;
      result.push({
        x: a.x + (b.x - a.x) * localT,
        y: a.y + (b.y - a.y) * localT,
      });
      return result;
    }
    walked += seg;
    result.push(points[i + 1]!);
  }

  return points;
}
