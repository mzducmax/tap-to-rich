/**
 * Public API for stickman-bomb gameplay layer.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export { HammerCursor } from './components/HammerCursor';
export type { HammerImpactPayload } from './components/HammerCursor';
export { NumberDisplay } from './components/NumberDisplay';
export { WeaponModeBadge, weaponModeBadgeStyles } from './components/WeaponModeBadge';

export { useGameplayScore } from './hooks/useGameplayScore';
export { useShake } from './hooks/useShake';

export { buildStats } from './logic/buildStats';
export { buildCounterTokens } from './logic/formatCounterDisplay';
export type { CounterToken } from './logic/formatCounterDisplay';

export {
  gameLayerClasses,
  gameLayerStyle,
  GAME_LAYER_Z,
} from './config/gameLayers';
export { GAMEPLAY_CYCLE_MS, BIRD_DELAY_AFTER_SHEEP_MS } from './config/gameplayCycle';
export {
  getExpandedHitRect,
  isClickInHitZone,
  isPointInHitZone,
  isStrikeInHitZone,
} from './config/hammerConfig';
export type { CounterDisplayStyle } from './config/counterDisplayStyle';
export {
  COUNTER_DISPLAY_STYLE_OPTIONS,
  COUNTER_DISPLAY_STYLE_STORAGE_KEY,
  loadCounterDisplayStyle,
  saveCounterDisplayStyle,
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

export type { PenaltyFloat, SheepBonusFloat, BirdBonusFloat } from './types/gameplayTypes';
