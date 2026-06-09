/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export { StickmanBombCanvas } from './StickmanBombCanvas';
export {
  BackgroundSettingsSection,
  GameBackgroundRoot,
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
  formatWeaponSwitchKeyLabel,
  loadWeaponMode,
  loadWeaponSwitchKey,
  saveWeaponMode,
  saveWeaponSwitchKey,
  WEAPON_SWITCH_KEY_OPTIONS,
} from './gameplay';
export type { WeaponMode } from './gameplay';
export { NumberDisplay, useGameplayScore, GameplayControlsSection, formatCounterLabel } from './gameplay';
export {
  BombSequence,
  BowSequence,
  CounterExplosion,
  keyActions,
  key1BombAction,
  key2BowAction,
  KEY_1_BOMB,
  KEY_2_BOW,
  BOW_PENALTY,
} from './key-one';
export { EstateSettingsSection, scoreToEstateLevel, useEstateImageSettings } from './estate';
export type { EstateImageOverrides, EstateLevel } from './estate';
export { BOMB_PENALTY, MISS_PENALTY_BOXES } from './types';
export type { StickmanBombCanvasHandle, StickmanBombCanvasProps } from './types';
