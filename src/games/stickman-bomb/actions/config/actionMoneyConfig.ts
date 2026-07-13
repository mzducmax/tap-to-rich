/**
 * Fixed-amount live actions whose money delta is editable from the settings panel.
 * Random / computed actions (dice, plinko, money spinner) are intentionally excluded.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { BOMB_PENALTY } from '../../types';
import { BIRD_POOP_PENALTY } from '../../gameplay/birds/config/birdConfig';
import { HACKER_PENALTY } from '../key-0/config/hackerEffectConfig';
import { GRAPPLE_CASH_AMOUNT } from '../key-3/config/grappleHookConfig';
import { AVATAR_COIN_REWARD } from '../key-4/config/avatarCoinConfig';
import { SOCCER_BALL_PENALTY } from '../key-8/config/soccerBallConfig';
import { TRUMP_SPAWN_REWARD } from '../key-9/config/trumpSpawnConfig';
import { PIG_BANK_REWARD } from '../key-10/config/pigBankConfig';
import { BUTTERFLY_REWARD } from '../key-11/config/butterflyConfig';
import { MISSILE_PENALTY } from '../key-12/config/missileStrikeConfig';
import { TOMATO_REWARD } from '../key-13/config/tomatoConfig';

/** Stable key used at the money apply sites in `StickmanBombCanvas.tsx`. */
export type ActionMoneyKey =
  | 'hack'
  | 'bomb'
  | 'grapple'
  | 'moneyTrain'
  | 'knife'
  | 'trump'
  | 'pigBank'
  | 'goldNugget'
  | 'missile'
  | 'tomato'
  | 'birdFlock';

/** Enemy actions subtract money, helper actions add money. */
export type ActionMoneySide = 'enemy' | 'helper';

export type FixedMoneyAction = {
  /** Network id — matches `config/defaultActions.json` + `ACTION_REGISTRY`. */
  actionId: number;
  key: ActionMoneyKey;
  label: string;
  emoji: string;
  /** Determines the sign applied to the (unsigned) amount entered in settings. */
  side: ActionMoneySide;
  /** Signed default delta — penalties are negative, rewards positive. */
  defaultAmount: number;
  /** Optional per-event unit suffix (e.g. money train credits every coin). */
  unitLabel?: string;
};

/** Bound so a stray input can't push the score to absurd values. */
export const MAX_ACTION_MONEY = 10_000_000;

export function clampActionMoney(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const rounded = Math.round(value);
  return Math.max(-MAX_ACTION_MONEY, Math.min(MAX_ACTION_MONEY, rounded));
}

/**
 * Ordered list rendered in the settings panel. `defaultAmount` pulls from the
 * existing gameplay constants so there is a single source of truth for defaults.
 */
export const FIXED_MONEY_ACTIONS: FixedMoneyAction[] = [
  { actionId: 1, key: 'hack', label: 'System hack', emoji: '💻', side: 'enemy', defaultAmount: -HACKER_PENALTY },
  { actionId: 2, key: 'bomb', label: 'Bomb', emoji: '💣', side: 'enemy', defaultAmount: -BOMB_PENALTY },
  { actionId: 4, key: 'grapple', label: 'Grappling hook heist', emoji: '🪝', side: 'enemy', defaultAmount: -GRAPPLE_CASH_AMOUNT },
  { actionId: 5, key: 'moneyTrain', label: 'Money train', emoji: '🚂', side: 'helper', defaultAmount: AVATAR_COIN_REWARD, unitLabel: 'per coin' },
  { actionId: 9, key: 'knife', label: 'Knife drop', emoji: '🔪', side: 'enemy', defaultAmount: -SOCCER_BALL_PENALTY },
  { actionId: 10, key: 'trump', label: 'Trump spawn', emoji: '🧑‍💼', side: 'enemy', defaultAmount: -TRUMP_SPAWN_REWARD },
  { actionId: 11, key: 'pigBank', label: 'Pig bank', emoji: '🐷', side: 'helper', defaultAmount: PIG_BANK_REWARD },
  { actionId: 12, key: 'goldNugget', label: 'Gold nugget slam', emoji: '🪙', side: 'helper', defaultAmount: BUTTERFLY_REWARD },
  { actionId: 13, key: 'missile', label: 'Missile strike', emoji: '🚀', side: 'enemy', defaultAmount: -MISSILE_PENALTY },
  { actionId: 17, key: 'tomato', label: 'Tomato throw', emoji: '🍅', side: 'helper', defaultAmount: TOMATO_REWARD },
  { actionId: 18, key: 'birdFlock', label: 'Bird flock', emoji: '🐦', side: 'enemy', defaultAmount: -BIRD_POOP_PENALTY, unitLabel: 'per hit' },
];

const BY_KEY: Record<ActionMoneyKey, FixedMoneyAction> = FIXED_MONEY_ACTIONS.reduce(
  (acc, entry) => {
    acc[entry.key] = entry;
    return acc;
  },
  {} as Record<ActionMoneyKey, FixedMoneyAction>,
);

/** All valid actionIds for override validation. */
export const FIXED_MONEY_ACTION_IDS: number[] = FIXED_MONEY_ACTIONS.map((a) => a.actionId);

export type ActionMoneyOverrides = Partial<Record<number, number>>;

/**
 * Signed money delta for an action — the override if set, otherwise the default.
 */
export function getActionMoneyAmount(
  key: ActionMoneyKey,
  overrides?: ActionMoneyOverrides,
): number {
  const entry = BY_KEY[key];
  const override = overrides?.[entry.actionId];
  if (override != null && Number.isFinite(override)) return clampActionMoney(override);
  return entry.defaultAmount;
}
