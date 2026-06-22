/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { RefObject } from 'react';
import type { GameStats, TimeOfDay } from '../../types';
import type { CounterDisplayStyle } from './gameplay';
import type { WeaponMode } from './gameplay';
import type { EstateLevel, EstateImageOverrides } from './estate';

export const CHEST_REWARD = 10;
export const MISS_PENALTY_BOXES = 10;

export interface StickmanBombCanvasProps {
  timeOfDay: TimeOfDay;
  onStatsChange: (stats: GameStats) => void;
  onGameOver: (finalScore: number) => void;
  onGameReset: () => void;
  onMissPenalty?: (remainingScore: number) => void;
  isMuted: boolean;
  targetScore: number;
  previewEstateLevel?: EstateLevel | null;
  estateImageOverrides?: EstateImageOverrides;
  freezeSway?: boolean;
  counterDisplayStyle?: CounterDisplayStyle;
  showCounter?: boolean;
  weaponMode?: WeaponMode;
  weaponSwitchKey?: string;
  onWeaponModeChange?: (mode: WeaponMode) => void;
  hammerEstateReward?: number;
  /** Avatar shown in key-[3] strike and key-[4] coin shower portals (optional). */
  avatarStrikeUrl?: string;
  /** Bottom HUD dock shell — zoom target for key-[0] balance drain. */
  balancePanelRef?: RefObject<HTMLElement | null>;
  /** Wrapper around bottom HUD — raised z-index during key-[0] drain. */
  balanceDockRef?: RefObject<HTMLElement | null>;
}

export interface StickmanBombCanvasHandle {
  placeBlock: () => void;
  resetGame: () => void;
  destroyTopBoxes: (count: number) => void;
  autoBuildBoxes: (count: number) => void;
  triggerAutoBuild50: () => void;
}
