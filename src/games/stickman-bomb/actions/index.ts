/**
 * Key actions feature exports (keys 0–9).
 * @license SPDX-License-Identifier: Apache-2.0
 */

export { randomAttackAngle } from './shared/attackGeometry';
export type { AttackAngle } from './shared/attackGeometry';

export {
  FIXED_MONEY_ACTIONS,
  FIXED_MONEY_ACTION_IDS,
  MAX_ACTION_MONEY,
  clampActionMoney,
  getActionMoneyAmount,
} from './config/actionMoneyConfig';
export type {
  ActionMoneyKey,
  ActionMoneyOverrides,
  FixedMoneyAction,
} from './config/actionMoneyConfig';
export {
  ACTION_MONEY_OVERRIDES_STORAGE_KEY,
  hasActionMoneyOverride,
  loadActionMoneyOverrides,
  saveActionMoneyOverrides,
} from './config/actionMoneySettings';
export { useActionMoneySettings } from './hooks/useActionMoneySettings';
export { ActionMoneySettingsSection } from './components/ActionMoneySettingsSection';

export { ActionSpawnQueueDock } from './shared/ActionSpawnQueueDock';
export {
  pushActionSpawnQueue,
  popActionSpawnQueue,
  shiftActionSpawnQueue,
  resetActionSpawnQueue,
} from './shared/actionSpawnQueueStore';
export type { ActionSpawnQueueSnapshot } from './shared/actionSpawnQueueStore';
export { getActionQueueVisual } from './shared/actionQueueVisuals';

export {
  HackerEffectLayer,
  useHackerEffect,
  HACKER_PENALTY,
  key0HackerAction,
} from './key-0';

export { BombSequence, CounterExplosion, ExplosionFlash, key1BombAction } from './key-1';
export {
  PlinkoLayer,
  usePlinko,
  PLINKO_BET,
  key2PlinkoAction,
  key2GiantGoldAction,
  key2BowAction,
} from './key-2';
export { BOW_PENALTY } from './shared/combatPenalties';
export {
  AvatarStrikeLayer,
  useAvatarStrike,
  key3AvatarStrikeAction,
  GRAPPLE_CASH_AMOUNT,
} from './key-3';
export {
  AvatarCoinLayer,
  useAvatarCoin,
  AVATAR_COIN_COUNT,
  AVATAR_COIN_REWARD,
  key4AvatarCoinAction,
} from './key-4';
export {
  MoneySpinnerLayer,
  useMoneySpinner,
  SPINNER_SEGMENTS,
  key5MoneySpinnerAction,
} from './key-5';
export type { ActiveMoneySpinner } from './key-5';
export {
  DiceRollLayer,
  useDiceRoll,
  diceFaceReward,
  diceTotalReward,
  key6DiceRollAction,
} from './key-6';
export {
  VerticalLightningLayer,
  useVerticalLightning,
  key7VerticalLightningAction,
} from './key-7';
export {
  SoccerBallLayer,
  useSoccerBallKick,
  SOCCER_BALL_PENALTY,
  key8SoccerBallAction,
} from './key-8';
export {
  TrumpSpawnLayer,
  useTrumpSpawn,
  TRUMP_SPAWN_REWARD,
  key9TrumpSpawnAction,
} from './key-9';
export {
  PigBankLayer,
  usePigBank,
  PIG_BANK_REWARD,
  PIG_BANK_REWARD_RAMP_MS,
  keyPPigBankAction,
} from './key-10';
export {
  ButterflyLayer,
  useButterfly,
  BUTTERFLY_REWARD,
  key11ButterflyAction,
} from './key-11';
export {
  MissileStrikeLayer,
  useMissileStrike,
  key12MissileAction,
  MISSILE_PENALTY,
} from './key-12';
export {
  TomatoLayer,
  useTomato,
  TOMATO_REWARD,
  key13TomatoAction,
} from './key-13';

export { keyActions } from './keyActions';
export { useKeyActions } from './useKeyActions';
export {
  KEY_0_HACKER,
  KEY_1_BOMB,
  KEY_2_PLINKO,
  KEY_2_BOW,
  KEY_3_AVATAR_STRIKE,
  KEY_4_AVATAR_COIN,
  KEY_5_MONEY_SPINNER,
  KEY_5_AVATAR_BUBBLE,
  KEY_6_DICE_ROLL,
  KEY_7_VERTICAL_LIGHTNING,
  KEY_8_SOCCER_BALL,
  KEY_9_TRUMP_SPAWN,
  KEY_P_PIG_BANK,
  KEY_O_BUTTERFLY,
  KEY_I_MISSILE,
  KEY_U_TOMATO,
} from './types';
export type { KeyActionContext, KeyActionDefinition } from './types';
export type { DiceLandPayload } from './key-6/types';
export type { PlinkoLandPayload } from './key-2/types';
