/**
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { BIRD_COUNT_MAX, BIRD_COUNT_MIN, BIRD_CROSSING_MS } from '../config/birdConfig';

export type BirdSpawn = {
  id: number;
  topPercent: number;
  delayMs: number;
  durationMs: number;
  scale: number;
  /** Wing-flap start frame 0–6 (offsets animation phase). */
  startFrame: number;
  /** Wing flap cycle duration in ms. */
  flapMs: number;
};

function createRng(seed: number) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

export function buildBirdFlock(waveId: number): BirdSpawn[] {
  const rng = createRng(waveId * 5_291 + 17);
  const count =
    BIRD_COUNT_MIN + Math.floor(rng() * (BIRD_COUNT_MAX - BIRD_COUNT_MIN + 1));
  const spawns: BirdSpawn[] = [];

  for (let i = 0; i < count; i++) {
    const topPercent = 4 + rng() * 14;
    const delayMs = Math.round(i * (280 + rng() * 360) + rng() * 200);
    const paceJitter = (rng() - 0.5) * 1_100;
    const durationMs = Math.round(BIRD_CROSSING_MS + paceJitter);
    const scale = 0.78 + rng() * 0.38;
    const startFrame = Math.floor(rng() * 7);
    const flapMs = Math.round(560 + rng() * 200);

    spawns.push({
      id: i,
      topPercent,
      delayMs,
      durationMs,
      scale,
      startFrame,
      flapMs,
    });
  }

  return spawns.sort((a, b) => a.delayMs - b.delayMs);
}
