/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import hammerSpriteUrl from '../assets/hammer.png';

export const HAMMER_ESTATE_REWARD_DEFAULT = 1;
export const MIN_HAMMER_ESTATE_REWARD = 1;
export const MAX_HAMMER_ESTATE_REWARD = 9999;
export const HAMMER_ESTATE_REWARD_STORAGE_KEY = 'stack_hammer_estate_reward';

/** Consecutive real hammer hits (clicks, not auto-hammer) needed to trigger a combo bonus. */
export const HAMMER_COMBO_HIT_TARGET = 20;
/** Extra money credited on top of the normal reward once the combo target is reached. */
export const HAMMER_COMBO_BONUS = 10;

/** Consecutive real hammer hits needed to trigger the bigger mega-combo bonus. */
export const HAMMER_MEGA_COMBO_HIT_TARGET = 100;
/** Extra money credited on top of the normal reward once the mega-combo target is reached. */
export const HAMMER_MEGA_COMBO_BONUS = 100;

/** Default score added each time the hammer hits the estate target. */
export const HAMMER_ESTATE_REWARD = HAMMER_ESTATE_REWARD_DEFAULT;

export function clampHammerEstateReward(value: number): number {
  if (!Number.isFinite(value)) return HAMMER_ESTATE_REWARD_DEFAULT;
  return Math.min(
    MAX_HAMMER_ESTATE_REWARD,
    Math.max(MIN_HAMMER_ESTATE_REWARD, Math.floor(value)),
  );
}

export function loadHammerEstateReward(): number {
  const saved = localStorage.getItem(HAMMER_ESTATE_REWARD_STORAGE_KEY);
  if (saved !== null) {
    const parsed = parseInt(saved, 10);
    if (Number.isFinite(parsed)) return clampHammerEstateReward(parsed);
  }
  return HAMMER_ESTATE_REWARD_DEFAULT;
}

export function saveHammerEstateReward(value: number) {
  localStorage.setItem(
    HAMMER_ESTATE_REWARD_STORAGE_KEY,
    String(clampHammerEstateReward(value)),
  );
}

/**
 * Auto-hammer: when enabled the estate is hit automatically on a fixed cadence
 * so money keeps accruing hands-free. Toggle lives in the game settings panel.
 */
export const AUTO_HAMMER_INTERVAL_MS = 1000;
export const AUTO_HAMMER_STORAGE_KEY = 'stack_auto_hammer';

export function loadAutoHammer(): boolean {
  return localStorage.getItem(AUTO_HAMMER_STORAGE_KEY) === 'true';
}

export function saveAutoHammer(enabled: boolean) {
  localStorage.setItem(AUTO_HAMMER_STORAGE_KEY, String(enabled));
}

/** Extra padding around the estate gameplay target — valid hammer strike zone */
export const HAMMER_HIT_ZONE_PADDING = 48;

export const HAMMER_SPRITE_URL = hammerSpriteUrl;
export const HAMMER_SPRITE_SIZE = 200;

/** Pivot (pommel) and head strike point — normalized 0–1 within the sprite */
export const HAMMER_PIVOT_NORM_X = 0.697;
export const HAMMER_PIVOT_NORM_Y = 0.826;
export const HAMMER_HEAD_NORM_X = 0.377;
export const HAMMER_HEAD_NORM_Y = 0.293;

/** Align sprite art orientation with the swing angle system */
export const HAMMER_SPRITE_ANGLE_OFFSET = 46;

/** Downward strike — pivot sits above the click so the head lands on target. */
export const HAMMER_STRIKE_PIVOT_OFFSET_Y = 78;

/**
 * Vertical travel of the pivot (hand) during a swing so the whole hammer
 * lifts on windup then drops on the smash — a pure rotation looks frozen.
 * Values are px relative to the resting strike pivot; negative = up.
 */
export const HAMMER_WINDUP_LIFT_Y = -52;
export const HAMMER_SMASH_DROP_Y = 20;

/** Swing arc mirrored around idle: windup right, smash left (degrees, before sprite offset). */
export const HAMMER_IDLE_ANGLE = -18;
export const HAMMER_WINDUP_ANGLE = 32;
export const HAMMER_SMASH_ANGLE = -88;
export const HAMMER_IMPACT_ANGLE = -76;

export type HitRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export function getExpandedHitRect(
  target: HTMLElement,
  container: HTMLElement,
  padding: number,
): HitRect {
  const targetRect = target.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  return {
    left: targetRect.left - containerRect.left - padding,
    top: targetRect.top - containerRect.top - padding,
    right: targetRect.right - containerRect.left + padding,
    bottom: targetRect.bottom - containerRect.top + padding,
  };
}

export function isPointInHitZone(x: number, y: number, zone: HitRect) {
  return x >= zone.left && x <= zone.right && y >= zone.top && y <= zone.bottom;
}

export function isStrikeInHitZone(
  impactX: number,
  impactY: number,
  pivotX: number,
  pivotY: number,
  target: HTMLElement | null,
  container: HTMLElement,
  padding: number = HAMMER_HIT_ZONE_PADDING,
) {
  if (!target) return false;

  const zone = getExpandedHitRect(target, container, padding);
  return (
    isPointInHitZone(impactX, impactY, zone) ||
    isPointInHitZone(pivotX, pivotY, zone)
  );
}

export function isClickInHitZone(
  clickX: number,
  clickY: number,
  target: HTMLElement | null,
  container: HTMLElement,
  padding: number = HAMMER_HIT_ZONE_PADDING,
) {
  if (!target) return false;
  const zone = getExpandedHitRect(target, container, padding);
  return isPointInHitZone(clickX, clickY, zone);
}
