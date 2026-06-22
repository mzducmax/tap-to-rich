/**
 * Key actions feature exports (keys 0–9).
 * @license SPDX-License-Identifier: Apache-2.0
 */

export { randomAttackAngle } from './shared/attackGeometry';
export type { AttackAngle } from './shared/attackGeometry';

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
  AVATAR_STRIKE_ARROW_COUNT,
  key3AvatarStrikeAction,
} from './key-3';
export {
  AvatarCoinLayer,
  useAvatarCoin,
  AVATAR_COIN_COUNT,
  AVATAR_COIN_REWARD,
  key4AvatarCoinAction,
} from './key-4';
export {
  DivineCrossbowLayer,
  useDivineCrossbow,
  key5DivineCrossbowAction,
  AvatarBubbleLayer,
  useAvatarBubble,
  key5AvatarBubbleAction,
} from './key-5';
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

export { keyActions } from './keyActions';
export { useKeyActions } from './useKeyActions';
export {
  KEY_0_HACKER,
  KEY_1_BOMB,
  KEY_2_PLINKO,
  KEY_2_BOW,
  KEY_3_AVATAR_STRIKE,
  KEY_4_AVATAR_COIN,
  KEY_5_AVATAR_BUBBLE,
  KEY_6_DICE_ROLL,
  KEY_7_VERTICAL_LIGHTNING,
  KEY_8_SOCCER_BALL,
  KEY_9_TRUMP_SPAWN,
} from './types';
export type { KeyActionContext, KeyActionDefinition } from './types';
export type { DiceLandPayload } from './key-6/types';
export type { PlinkoLandPayload } from './key-2/types';
