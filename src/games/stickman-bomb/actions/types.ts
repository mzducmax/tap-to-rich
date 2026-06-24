/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const KEY_0_HACKER = '0';
export const KEY_1_BOMB = '1';
export const KEY_2_PLINKO = '2';
/** @deprecated Use KEY_2_PLINKO */
export const KEY_2_BOW = KEY_2_PLINKO;
export const KEY_3_AVATAR_STRIKE = '3';
export const KEY_4_AVATAR_COIN = '4';
export const KEY_5_AVATAR_BUBBLE = '5';
export const KEY_6_DICE_ROLL = '6';
export const KEY_7_VERTICAL_LIGHTNING = '7';
export const KEY_8_SOCCER_BALL = '8';
export const KEY_9_TRUMP_SPAWN = '9';
export const KEY_P_PIG_BANK = 'p';
export const KEY_O_BUTTERFLY = 'o';

export type KeyActionContext = {
  triggerHackerEffect: () => void;
  startBombing: () => void;
  triggerPlinko: () => void;
  triggerAvatarStrike: () => void;
  triggerAvatarCoin: () => void;
  triggerDivineCrossbow: () => void;
  triggerDiceRoll: () => void;
  triggerVerticalLightning: () => void;
  triggerSoccerBallKick: () => void;
  triggerTrumpSpawn: () => void;
  triggerPigBank: () => void;
  triggerButterfly: () => void;
  paused: boolean;
  /** True while a key-0 hacker effect instance is actively playing. */
  hackerEffectRunning: boolean;
  /** True while a key-2 Plinko overlay round is on screen. */
  plinkoRunning: boolean;
};

/** Keys 1, 3–9: defer to pending queue while key 0 or key 2 is running. */
export function canRunGameplayKey(ctx: KeyActionContext): boolean {
  return !ctx.paused && !ctx.hackerEffectRunning && !ctx.plinkoRunning;
}

/** Key 2: may queue another round while Plinko is already open. */
export function canRunPlinkoKey(ctx: KeyActionContext): boolean {
  return !ctx.paused && !ctx.hackerEffectRunning;
}

export type KeyActionDefinition = {
  key: string;
  label: string;
  canRun: (ctx: KeyActionContext) => boolean;
  run: (ctx: KeyActionContext) => void;
};
