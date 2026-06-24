/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { SheepVariant } from '../sheep/config/sheepConfig';

export type PenaltyFloat = {
  id: number;
  delta: number;
  source: ScoreFloatSource;
  sheepVariant?: SheepVariant;
};

export type ScoreFloatSource =
  | 'hammer'
  | 'gun'
  | 'key-0'
  | 'key-1'
  | 'key-2'
  | 'key-3'
  | 'key-4'
  | 'key-5'
  | 'key-6'
  | 'key-7'
  | 'key-8'
  | 'key-9'
  | 'key-p'
  | 'key-11'
  | 'sheep'
  | 'bird'
  | 'mole'
  | 'auto'
  | 'system'
  | 'market';

export type { SheepBonusFloat } from '../sheep';
export type { BirdBonusFloat } from '../birds';
export type { MoleBonusFloat } from '../moles';
