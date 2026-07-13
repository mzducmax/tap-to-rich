/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { RefObject } from 'react';
import type { GameStats, TimeOfDay } from '../../types';
import type { CounterDisplayStyle } from './gameplay';
import type { WeaponMode } from './gameplay';
import type { EstateLevel, EstateImageOverrides } from './estate';
import type { ActionMoneyOverrides } from './actions';
import type { GameEffectId } from '../../networking/gameActionExecutor';

export const BOMB_PENALTY = 10;
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
  /** Editable +/- money amount per fixed live action (settings panel overrides). */
  actionMoneyOverrides?: ActionMoneyOverrides;
  freezeSway?: boolean;
  counterDisplayStyle?: CounterDisplayStyle;
  showCounter?: boolean;
  weaponMode?: WeaponMode;
  weaponSwitchKey?: string;
  onWeaponModeChange?: (mode: WeaponMode) => void;
  hammerEstateReward?: number;
  /** When true, the estate is auto-hit on a fixed cadence to earn money hands-free. */
  autoHammer?: boolean;
  /** When true, the sheep herd and mouse swarm auto-spawn on their fixed cadence. */
  autoHerdSpawn?: boolean;
  /** Gap (ms) between one auto-spawn wave leaving and the next appearing. Defaults to `HERD_AUTO_SPAWN_GAP_MS`. */
  herdAutoSpawnGapMs?: number;
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
  /** Clears all in-flight action effects (birds, sheep, moles, projectiles, …) without touching score. */
  clearActiveEffects: () => void;
  destroyTopBoxes: (count: number) => void;
  autoBuildBoxes: (count: number) => void;
  triggerAutoBuild50: () => void;
  triggerMoleWave: () => boolean;
  triggerBirdWave: () => boolean;
  /** Run a gameplay effect by id (network `game_execute_action` → canvas). */
  triggerActionEffect: (effectId: GameEffectId) => void;
  triggerBorrowMoney: () => boolean;
  deductBalance: (amount: number) => boolean;
}
