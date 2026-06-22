/**
 * Public API for stickman-bomb gameplay layer.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export { HammerCursor } from './components/HammerCursor';
export type { HammerImpactPayload } from './components/HammerCursor';
export { NumberDisplay } from './components/NumberDisplay';
export { GameplayControlsSection } from './components/GameplayControlsSection';
export { WeaponModeBadge, weaponModeBadgeStyles } from './components/WeaponModeBadge';
export { SeasonSessionBadge, seasonSessionBadgeStyles } from './components/SeasonSessionBadge';
export { EstateScoreFloat } from './components/EstateScoreFloat';

export { useGameplayScore } from './hooks/useGameplayScore';
export { useShake, useEstateHitShake } from './hooks/useShake';

export { buildStats } from './logic/buildStats';
export { buildCounterTokens, formatCounterLabel } from './logic/formatCounterDisplay';
export type { CounterToken } from './logic/formatCounterDisplay';

export {
  gameLayerClasses,
  gameLayerStyle,
  GAME_LAYER_Z,
} from './config/gameLayers';
export { gamePausedStyles } from './config/pauseStyles';
export { setGameplayPaused, resetGameplayPauseClock } from './logic/gameplayPause';
export {
  clampHammerEstateReward,
  getExpandedHitRect,
  HAMMER_ESTATE_REWARD,
  HAMMER_ESTATE_REWARD_DEFAULT,
  loadHammerEstateReward,
  MAX_HAMMER_ESTATE_REWARD,
  MIN_HAMMER_ESTATE_REWARD,
  saveHammerEstateReward,
  isClickInHitZone,
  isPointInHitZone,
  isStrikeInHitZone,
} from './config/hammerConfig';
export type { CounterDisplayStyle } from './config/counterDisplayStyle';
export {
  COUNTER_DISPLAY_STYLE_OPTIONS,
  COUNTER_DISPLAY_STYLE_STORAGE_KEY,
  COUNTER_VISIBLE_STORAGE_KEY,
  loadCounterDisplayStyle,
  saveCounterDisplayStyle,
  loadCounterVisible,
  saveCounterVisible,
} from './config/counterDisplayStyle';
export {
  formatWeaponSwitchKeyLabel,
  loadWeaponMode,
  loadWeaponSwitchKey,
  saveWeaponMode,
  saveWeaponSwitchKey,
  WEAPON_SWITCH_KEY_OPTIONS,
} from './config/weaponSettings';
export type { WeaponMode } from './config/weaponSettings';

export type { PenaltyFloat, SheepBonusFloat, BirdBonusFloat, MoleBonusFloat } from './types/gameplayTypes';
