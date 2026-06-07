/**
 * Public API for the sheep herd feature.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export { FloatingSheepBonus } from './components/FloatingSheepBonus';
export { SheepAimShoot } from './components/SheepAimShoot';
export { SheepHerd } from './components/SheepHerd';
export { SheepHitBurst } from './components/SheepHitBurst';
export { SheepWarningBanner } from './components/SheepWarningBanner';
export { StickSheepIcon } from './components/StickSheepIcon';

export { useSheepHerd } from './hooks/useSheepHerd';

export type { SheepBonusFloat, SheepHitEffect } from './types/sheepTypes';
export type { SheepSpawn } from './logic/sheepFormation';

export {
  SHEEP_CROSSING_MS,
  SHEEP_INTERVAL_MS,
  SHEEP_REWARD,
  SHEEP_WARNING_MS,
  SHEEP_WAVE_DURATION_MS,
} from './config/sheepConfig';

export { scopeViewStyles, SCOPE_ZOOM } from './styles/scopeStyles';

export { hitTestSheepAtPoint } from './logic/sheepHitTest';
