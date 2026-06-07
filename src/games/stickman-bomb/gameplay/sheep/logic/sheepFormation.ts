/**
 * Organic flock layout — each sheep has its own lane, timing, and size.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { SHEEP_CROSSING_MS, SHEEP_COUNT } from '../config/sheepConfig';

export type SheepSpawn = {
  id: number;
  topPercent: number;
  delayMs: number;
  durationMs: number;
  scale: number;
  bobDurationMs: number;
  depth: number;
};

function createRng(seed: number) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;

  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

/** Deterministic flock per wave — loose cluster, staggered, varied pace. */
export function buildSheepFormation(waveId: number): SheepSpawn[] {
  const rng = createRng(waveId * 9_731 + 42);
  const count = SHEEP_COUNT;
  const spawns: SheepSpawn[] = [];

  for (let i = 0; i < count; i++) {
    const trail = i / Math.max(1, count - 1);
    const clusterY = Math.sin(trail * Math.PI * 0.85) * 6;
    const spreadY = (rng() - 0.5) * 18;
    const topPercent = 50 + clusterY + spreadY;

    const delayMs = Math.round(i * (140 + rng() * 90) + rng() * 60);
    const paceJitter = (rng() - 0.5) * 900;
    const durationMs = Math.round(SHEEP_CROSSING_MS + paceJitter);

    const depth = rng();
    const scale = 0.72 + depth * 0.38;

    spawns.push({
      id: i,
      topPercent,
      delayMs,
      durationMs,
      scale,
      bobDurationMs: Math.round(420 + rng() * 280),
      depth,
    });
  }

  return spawns.sort((a, b) => a.delayMs - b.delayMs);
}
