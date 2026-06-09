/**
 * Game background system — classic atmosphere and score-based level scenes.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export { BackgroundSettingsSection } from './components/BackgroundSettingsSection';
export { ClassicBackgroundScene } from './components/ClassicBackgroundScene';
export { GameBackgroundRoot } from './components/GameBackgroundRoot';
export { LevelBackgroundLayer } from './components/LevelBackgroundLayer';

export {
  ATMOSPHERE_THEME_OPTIONS,
  ATMOSPHERE_THEMES,
  loadAtmosphereTheme,
  saveAtmosphereTheme,
} from './config/atmosphereTheme';
export type { AtmosphereTheme } from './config/atmosphereTheme';

export {
  BACKGROUND_DISPLAY_MODE_OPTIONS,
  loadBackgroundDisplayMode,
  saveBackgroundDisplayMode,
} from './config/displayMode';
export type { BackgroundDisplayMode } from './config/displayMode';

export {
  ALL_BACKGROUND_LEVELS,
  formatLevelLabel,
  formatLevelThreshold,
  getLevelBackgroundUrl,
  getTargetLevelHint,
  NEGATIVE_BACKGROUND_LEVELS,
  POSITIVE_BACKGROUND_LEVELS,
  REFERENCE_TARGET_FOR_LEVELS,
  scoreToBackgroundLevel,
} from './config/levelConfig';
export type { BackgroundLevel } from './config/levelConfig';

/** @deprecated use ALL_BACKGROUND_LEVELS */
export { ALL_BACKGROUND_LEVELS as BACKGROUND_LEVELS } from './config/levelConfig';
export { POSITIVE_LEVEL_COUNT as BACKGROUND_LEVEL_COUNT } from './config/levelConfig';

export {
  clampScoreToBounds,
  clampTargetScore,
  DEFAULT_TARGET_SCORE,
  getScoreBounds,
  getTargetProgressPercent,
  getNegativeProgressPercent,
  getPositiveProgressPercent,
  hasReachedTarget,
  hasReachedWinTarget,
  hasReachedLoseTarget,
  getLoseTargetScore,
  loadTargetScore,
  MAX_TARGET_SCORE,
  MIN_TARGET_SCORE,
  saveTargetScore,
} from './config/targetLimits';

export { useGameBackground } from './hooks/useGameBackground';

export type { ActiveThemeKey, TimeOfDay } from './types';
