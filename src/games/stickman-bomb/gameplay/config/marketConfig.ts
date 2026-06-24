/**
 * Game market catalog — mini-games shown in the [M] panel.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { BIRD_SHOOT_REWARD } from '../birds/config/birdConfig';
import { MOLE_REWARD } from '../moles/config/moleConfig';

export const BORROW_MONEY_LOAN = 500;

export const MOLE_ENTRY_COST = 10;
export const BIRD_ENTRY_COST = 10;

export type MarketGameId = 'mole' | 'bird' | 'loan';

export type MarketGameItem = {
  id: MarketGameId;
  name: string;
  priceLabel: string;
  cost: number;
  hotkey?: string;
};

export const MARKET_GAMES: MarketGameItem[] = [
  {
    id: 'mole',
    name: 'Whack-a-Mole',
    priceLabel: `-$${MOLE_ENTRY_COST}`,
    cost: MOLE_ENTRY_COST,
    hotkey: 'E',
  },
  {
    id: 'bird',
    name: 'Bird Flock',
    priceLabel: `-$${BIRD_ENTRY_COST}`,
    cost: BIRD_ENTRY_COST,
    hotkey: 'W',
  },
  {
    id: 'loan',
    name: 'Borrow Money',
    priceLabel: `+$${BORROW_MONEY_LOAN}`,
    cost: 0,
  },
];

export function formatHouseLevelLabel(level: number): string {
  if (level === 0) return 'House Level 0';
  if (level > 0) return `House Level +${level}`;
  return `House Level ${level}`;
}
