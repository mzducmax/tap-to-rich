/**
 * Scattered hole layout across the playfield.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { MOLE_COUNT, MOLE_IDLE_MAX_MS, MOLE_IDLE_MIN_MS } from '../config/moleConfig';

export type MoleSpawn = {
  id: number;
  leftPercent: number;
  topPercent: number;
  scale: number;
  firstPopDelayMs: number;
};

function createRng(seed: number) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;

  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function isTooClose(
  left: number,
  top: number,
  placed: { leftPercent: number; topPercent: number }[],
  minDist: number,
) {
  return placed.some((hole) => {
    const dx = left - hole.leftPercent;
    const dy = top - hole.topPercent;
    return Math.hypot(dx, dy) < minDist;
  });
}

/** Deterministic hole grid per wave — spread across the canvas. */
export function buildMoleField(waveId: number): MoleSpawn[] {
  const rng = createRng(waveId * 13_371 + 7);
  const spawns: MoleSpawn[] = [];
  const placed: { leftPercent: number; topPercent: number }[] = [];
  let attempts = 0;

  while (spawns.length < MOLE_COUNT && attempts < MOLE_COUNT * 40) {
    attempts += 1;
    const leftPercent = 8 + rng() * 84;
    const topPercent = 14 + rng() * 72;

    if (isTooClose(leftPercent, topPercent, placed, 9)) continue;

    placed.push({ leftPercent, topPercent });
    const scale = 0.9 + rng() * 0.22;
    const firstPopDelayMs = Math.round(
      MOLE_IDLE_MIN_MS + rng() * (MOLE_IDLE_MAX_MS - MOLE_IDLE_MIN_MS),
    );

    spawns.push({
      id: spawns.length,
      leftPercent,
      topPercent,
      scale,
      firstPopDelayMs,
    });
  }

  return spawns;
}
