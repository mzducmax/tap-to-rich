/**
 * Procedural jagged lightning paths (midpoint displacement).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import type { Point2 } from '../../shared/animationUtils';

export type BoltGeometry = {
  main: Point2[];
  branches: Point2[][];
};

function subdivide(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  displacement: number,
  depth: number,
): Point2[] {
  if (depth <= 0 || displacement < 1.5) {
    return [
      { x: x1, y: y1 },
      { x: x2, y: y2 },
    ];
  }

  const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * displacement;
  const my = (y1 + y2) / 2 + (Math.random() - 0.5) * displacement * 0.22;
  const left = subdivide(x1, y1, mx, my, displacement * 0.52, depth - 1);
  const right = subdivide(mx, my, x2, y2, displacement * 0.52, depth - 1);
  return [...left.slice(0, -1), ...right];
}

export function generateVerticalBoltGeometry(
  cloudX: number,
  startY: number,
  tipX: number,
  tipY: number,
): BoltGeometry {
  const len = Math.hypot(tipX - cloudX, tipY - startY);
  const displacement = Math.min(148, Math.max(52, len * 0.14));
  // Depth 7 → ~128 segments, richer fractal than depth-6
  const main = subdivide(cloudX, startY, tipX, tipY, displacement, 7);

  const branches: Point2[][] = [];
  // 3 primary branches guaranteed, occasional 4th
  const numPrimary = 3 + (Math.random() > 0.45 ? 1 : 0);
  for (let i = 0; i < numPrimary; i += 1) {
    const t = 0.15 + Math.random() * 0.58;
    const idx = Math.min(main.length - 2, Math.max(1, Math.floor(t * (main.length - 1))));
    const origin = main[idx]!;
    const side = i % 2 === 0 ? -1 : 1;
    const spread = 28 + Math.random() * 92;
    const endX = origin.x + side * spread;
    const endY = origin.y + 20 + Math.random() * Math.min(120, len * 0.22);
    const branch = subdivide(origin.x, origin.y, endX, endY, displacement * 0.42, 4);
    branches.push(branch);

    // Sub-branch off ~half the primary branches for extra fractal density
    if (branch.length > 5 && Math.random() > 0.48) {
      const subIdx = Math.floor(branch.length * (0.28 + Math.random() * 0.44));
      const subOrigin = branch[subIdx]!;
      const subSide = side * (Math.random() > 0.5 ? 1 : -1);
      const subEndX = subOrigin.x + subSide * (10 + Math.random() * 46);
      const subEndY = subOrigin.y + 10 + Math.random() * 40;
      branches.push(
        subdivide(subOrigin.x, subOrigin.y, subEndX, subEndY, displacement * 0.24, 3),
      );
    }
  }

  return { main, branches };
}

export function boltGeometryBounds(geometry: BoltGeometry, padding: number) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const scan = (p: Point2) => {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  };

  for (const p of geometry.main) scan(p);
  for (const branch of geometry.branches) {
    for (const p of branch) scan(p);
  }

  return {
    minX: minX - padding,
    minY: minY - padding,
    maxX: maxX + padding,
    maxY: maxY + padding,
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2,
  };
}
