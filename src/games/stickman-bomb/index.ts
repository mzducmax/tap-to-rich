/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export {
  StickmanBombCanvas,
  HERD_AUTO_SPAWN_GAP_MS,
} from './StickmanBombCanvas';
export {
  BackgroundSettingsSection,
  GameBackgroundRoot,
  getLevelTheme,
  useGameBackground,
  clampTargetScore,
  loadTargetScore,
  saveTargetScore,
  hasReachedTarget,
  hasReachedWinTarget,
  hasReachedLoseTarget,
  getLoseTargetScore,
  MIN_TARGET_SCORE,
  MAX_TARGET_SCORE,
} from './background';
export type { BackgroundDisplayMode, BackgroundLevel, TimeOfDay } from './background';
export {
  COUNTER_DISPLAY_STYLE_OPTIONS,
  loadCounterDisplayStyle,
  saveCounterDisplayStyle,
  loadCounterVisible,
  saveCounterVisible,
} from './gameplay';
export type { CounterDisplayStyle } from './gameplay';
export {
  loadAutoHerdSpawn,
  saveAutoHerdSpawn,
  clampHerdAutoSpawnGapSec,
  loadHerdAutoSpawnGapSec,
  saveHerdAutoSpawnGapSec,
  MIN_HERD_AUTO_SPAWN_GAP_SEC,
  MAX_HERD_AUTO_SPAWN_GAP_SEC,
} from './gameplay';
export {
  AUTO_HAMMER_INTERVAL_MS,
  loadAutoHammer,
  saveAutoHammer,
  clampHammerEstateReward,
  formatWeaponSwitchKeyLabel,
  loadHammerEstateReward,
  loadWeaponMode,
  loadWeaponSwitchKey,
  MAX_HAMMER_ESTATE_REWARD,
  MIN_HAMMER_ESTATE_REWARD,
  saveHammerEstateReward,
  saveWeaponMode,
  saveWeaponSwitchKey,
  WEAPON_SWITCH_KEY_OPTIONS,
} from './gameplay';
export type { WeaponMode } from './gameplay';
export {
  NumberDisplay,
  useGameplayScore,
  GameplayControlsSection,
  GameMarketPanel,
  formatCounterLabel,
  formatHouseLevelLabel,
  BORROW_MONEY_LOAN,
  MARKET_GAMES,
} from './gameplay';
export type { MarketGameId } from './gameplay';
export {
  BombSequence,
  PlinkoLayer,
  CounterExplosion,
  keyActions,
  key1BombAction,
  key2PlinkoAction,
  key2GiantGoldAction,
  key2BowAction,
  key3AvatarStrikeAction,
  key4AvatarCoinAction,
  key5MoneySpinnerAction,
  key6DiceRollAction,
  key7VerticalLightningAction,
  key8SoccerBallAction,
  KEY_1_BOMB,
  KEY_2_PLINKO,
  KEY_2_BOW,
  KEY_3_AVATAR_STRIKE,
  KEY_4_AVATAR_COIN,
  KEY_5_MONEY_SPINNER,
  KEY_6_DICE_ROLL,
  KEY_7_VERTICAL_LIGHTNING,
  KEY_8_SOCCER_BALL,
  PLINKO_BET,
  SOCCER_BALL_PENALTY,
  AVATAR_COIN_REWARD,
  FIXED_MONEY_ACTIONS,
  getActionMoneyAmount,
  useActionMoneySettings,
  ActionMoneySettingsSection,
} from './actions';
export type { ActionMoneyKey, ActionMoneyOverrides } from './actions';
export { EstateSettingsSection, scoreToEstateLevel, useEstateImageSettings } from './estate';
export type { EstateImageOverrides, EstateLevel } from './estate';
export { BOMB_PENALTY, MISS_PENALTY_BOXES } from './types';
export type { StickmanBombCanvasHandle, StickmanBombCanvasProps } from './types';
