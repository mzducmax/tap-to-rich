/**
 * Toss-up ballistic arc for gold nuggets (key 11 / [O]).
 * @license SPDX-License-Identifier: Apache-2.0
 */

export type Pt = { x: number; y: number };

export function createRng(seed: number) {
  let state = Math.abs(Math.floor(seed)) % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

export type TossLaunch = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
};

/** Spawn near the bottom, launch upward on a lob arc toward the house. */
export function buildTossLaunch(
  spawnId: number,
  width: number,
  height: number,
  house: Pt,
  gravity: number,
  tossTimeMs: number,
): TossLaunch {
  const rng = createRng(spawnId * 2654435761 + 17);
  const spawnX = width * (0.22 + rng() * 0.56);
  const spawnY = height * (0.86 + rng() * 0.08);
  const flightSec = (tossTimeMs * (0.92 + rng() * 0.22)) / 1000;

  const vx = (house.x - spawnX) / flightSec;
  const vy = (house.y - spawnY - 0.5 * gravity * flightSec * flightSec) / flightSec;

  return { x: spawnX, y: spawnY, vx, vy, gravity };
}
