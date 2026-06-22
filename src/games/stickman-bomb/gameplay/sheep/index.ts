/**
 * Public API for the sheep herd feature.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export { FloatingSheepBonus } from './components/FloatingSheepBonus';
export { SheepAimShoot } from './components/SheepAimShoot';
export { SheepHerd } from './components/SheepHerd';
export { SheepHitBurst } from './components/SheepHitBurst';

export { useSheepHerd } from './hooks/useSheepHerd';

export type { SheepBonusFloat, SheepHitEffect, SheepHitOutcome } from './types/sheepTypes';
export type { SheepSpawn } from './logic/sheepFormation';

export {
  getSheepHitDelta,
  SHEEP_BLACK_PENALTY,
  SHEEP_CROSSING_MS,
  SHEEP_GOLD_REWARD,
  SHEEP_PINK_REWARD,
  SHEEP_REWARD,
  SHEEP_WAVE_DURATION_MS,
  SHEEP_WAVE_INTERVAL_MS,
} from './config/sheepConfig';
export type { SheepDirection, SheepVariant } from './config/sheepConfig';

export { scopeViewStyles, SCOPE_ZOOM } from './styles/scopeStyles';

export { hitTestSheepAtPoint } from './logic/sheepHitTest';
