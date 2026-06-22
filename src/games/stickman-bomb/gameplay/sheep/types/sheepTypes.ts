/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { SheepVariant } from '../config/sheepConfig';

export type SheepBonusFloat = {
  id: number;
  variant: Exclude<SheepVariant, 'black'>;
};

export type SheepHitEffect = {
  id: number;
  x: number;
  y: number;
  variant: SheepVariant;
};

export type SheepHitOutcome = SheepVariant;
