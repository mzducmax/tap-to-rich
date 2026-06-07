/**
 * Public API for the bird flock feature.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export { BirdFlockLayer } from './components/BirdFlockLayer';
export { BirdHitBurst } from './components/BirdHitBurst';
export { BirdSplat } from './components/BirdSplat';
export { FloatingBirdBonus } from './components/FloatingBirdBonus';
export { PigeonBird } from './components/PigeonBird';

export { useBirdFlock } from './hooks/useBirdFlock';

export type {
  BirdBonusFloat,
  BirdHitEffect,
  BirdPoopDrop,
  BirdPoopPenaltyFloat,
  BirdSplatMark,
} from './types/birdTypes';

export type { BirdSpawn } from './logic/buildBirdFlock';

export {
  BIRD_INTERVAL_MS,
  BIRD_POOP_PENALTY,
  BIRD_SHOOT_REWARD,
} from './config/birdConfig';

export { isBirdInPoopZone, hitTestBirdAtPoint } from './logic/birdHitTest';
