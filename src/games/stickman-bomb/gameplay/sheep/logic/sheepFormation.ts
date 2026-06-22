/**
 * Organic flock layout — each sheep has its own lane, timing, and size.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import {
  SHEEP_BASE_COUNT,
  SHEEP_BLACK_MAX,
  SHEEP_BLACK_MIN,
  SHEEP_CROSSING_MS,
  SHEEP_COUNT,
  SHEEP_GOLD_COUNT,
  SHEEP_PINK_COUNT,
  SHEEP_REAR_SPREAD_Y,
  SHEEP_REAR_TOP_RANGE,
  SHEEP_REAR_TOP_START,
  SHEEP_SPAWN_CENTER_Y,
  SHEEP_SPAWN_CLUSTER_AMP,
  SHEEP_SPAWN_SPREAD_Y,
  type SheepDirection,
  type SheepVariant,
} from '../config/sheepConfig';

export type SheepSpawn = {
  id: number;
  topPercent: number;
  delayMs: number;
  durationMs: number;
  scale: number;
  bobDurationMs: number;
  depth: number;
  variant: SheepVariant;
  /** Trailing rear extension sheep — smaller, further back. */
  isRear: boolean;
};

function createRng(seed: number) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;

  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function assignVariants(rng: () => number, count: number): SheepVariant[] {
  const variants: SheepVariant[] = Array.from({ length: count }, () => 'white');

  const blackCount =
    SHEEP_BLACK_MIN + Math.floor(rng() * (SHEEP_BLACK_MAX - SHEEP_BLACK_MIN + 1));
  const blackIds = new Set<number>();
  while (blackIds.size < blackCount) {
    blackIds.add(Math.floor(rng() * count));
  }
  for (const id of blackIds) {
    variants[id] = 'black';
  }

  const goldIds = new Set<number>();
  while (goldIds.size < SHEEP_GOLD_COUNT) {
    const id = Math.floor(rng() * count);
    if (blackIds.has(id)) continue;
    goldIds.add(id);
  }
  for (const id of goldIds) {
    variants[id] = 'gold';
  }

  const takenIds = new Set([...blackIds, ...goldIds]);
  const pinkIds = new Set<number>();
  while (pinkIds.size < SHEEP_PINK_COUNT) {
    const id = Math.floor(rng() * count);
    if (takenIds.has(id)) continue;
    pinkIds.add(id);
  }
  for (const id of pinkIds) {
    variants[id] = 'pink';
  }

  return variants;
}

function buildFrontSheep(
  rng: () => number,
  id: number,
  count: number,
  variant: SheepVariant,
): SheepSpawn {
  const trail = id / Math.max(1, count - 1);
  const clusterY = Math.sin(trail * Math.PI * 0.85) * SHEEP_SPAWN_CLUSTER_AMP;
  const spreadY = (rng() - 0.5) * SHEEP_SPAWN_SPREAD_Y;
  const topPercent = SHEEP_SPAWN_CENTER_Y + clusterY + spreadY;

  const delayMs = Math.round(id * (140 + rng() * 90) + rng() * 60);
  const paceJitter = (rng() - 0.5) * 900;
  const durationMs = Math.round(SHEEP_CROSSING_MS + paceJitter);

  const depth = rng() * 0.55;
  const scale = 0.72 + depth * 0.38;

  return {
    id,
    topPercent,
    delayMs,
    durationMs,
    scale,
    bobDurationMs: Math.round(420 + rng() * 280),
    depth,
    variant,
    isRear: false,
  };
}

function buildRearSheep(
  rng: () => number,
  id: number,
  rearIndex: number,
  rearCount: number,
  baseMaxDelay: number,
  variant: SheepVariant,
): SheepSpawn {
  const trail = rearIndex / Math.max(1, rearCount - 1);
  const depth = 0.62 + rng() * 0.38;
  const scale = 0.58 + depth * 0.28;
  const spreadY = (rng() - 0.5) * SHEEP_REAR_SPREAD_Y;
  const topPercent = SHEEP_REAR_TOP_START + trail * SHEEP_REAR_TOP_RANGE + spreadY;

  const delayMs = Math.round(
    baseMaxDelay + rearIndex * (180 + rng() * 120) + rng() * 140,
  );
  const paceJitter = 120 + rng() * 520;
  const durationMs = Math.round(SHEEP_CROSSING_MS + paceJitter);

  return {
    id,
    topPercent,
    delayMs,
    durationMs,
    scale,
    bobDurationMs: Math.round(480 + rng() * 240),
    depth,
    variant,
    isRear: true,
  };
}

/** Deterministic flock per wave — front cluster plus a rear extension. */
export function buildSheepFormation(waveId: number): SheepSpawn[] {
  const rng = createRng(waveId * 9_731 + 42);
  const variants = assignVariants(rng, SHEEP_COUNT);
  const rearCount = SHEEP_COUNT - SHEEP_BASE_COUNT;
  const spawns: SheepSpawn[] = [];

  for (let i = 0; i < SHEEP_BASE_COUNT; i++) {
    spawns.push(buildFrontSheep(rng, i, SHEEP_BASE_COUNT, variants[i]));
  }

  const baseMaxDelay = spawns.reduce((max, sheep) => Math.max(max, sheep.delayMs), 0);

  for (let i = 0; i < rearCount; i++) {
    const id = SHEEP_BASE_COUNT + i;
    spawns.push(
      buildRearSheep(rng, id, i, rearCount, baseMaxDelay, variants[id]),
    );
  }

  return spawns.sort((a, b) => a.delayMs - b.delayMs);
}

/** Deterministic travel direction per wave. */
export function pickSheepDirection(waveId: number): SheepDirection {
  const rng = createRng(waveId * 3_141 + 17);
  return rng() < 0.5 ? 'ltr' : 'rtl';
}
