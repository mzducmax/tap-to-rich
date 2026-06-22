/**
 * Dice roll tuning (key 6).
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const DICE_SIZE = 78;
export const DICE_HALF = DICE_SIZE / 2;

export const DICE_MAX_CONCURRENT = 4;
export const DICE_SPAWN_COOLDOWN_MS = 320;

export const DICE_GRAVITY = 1180;
export const DICE_AIR_DRAG = 0.12;
export const DICE_RESTITUTION = 0.48;
export const DICE_FRICTION = 0.91;
export const DICE_ROLL_DECAY = 0.992;
/** Airborne spin barely decays — angular momentum conserved while falling. */
export const DICE_ANGULAR_DAMP_AIR = 0.06;
export const DICE_ANGULAR_DAMP_GROUND = 0.987;

export const DICE_SETTLE_SPEED = 20;
export const DICE_SETTLE_SPIN = 52;
export const DICE_SETTLE_FRAMES = 22;
export const DICE_STOP_HOLD_MS = 260;
export const DICE_SETTLE_LERP_MS = 340;
export const DICE_LAND_HOLD_MS = 680;
export const DICE_BURST_MS = 720;
export const DICE_MAX_SPIN = 1650;

export const DICE_MULTIPLIER_MIN = 10;
export const DICE_MULTIPLIER_MAX = 100;

/** Reward equals face value (1–6). */
export function diceFaceReward(face: number): number {
  return Math.max(1, Math.min(6, Math.floor(face)));
}

export function rollDiceMultiplier(): number {
  return (
    Math.floor(
      Math.random() * (DICE_MULTIPLIER_MAX - DICE_MULTIPLIER_MIN + 1),
    ) + DICE_MULTIPLIER_MIN
  );
}

export function diceTotalReward(face: number, multiplier: number): number {
  return diceFaceReward(face) * Math.max(1, Math.floor(multiplier));
}
