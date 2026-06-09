/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const KEY_1_BOMB = '1';
export const KEY_2_BOW = '2';

export type KeyActionContext = {
  startBombing: () => void;
  startBowAttack: () => void;
  paused: boolean;
};

export type KeyActionDefinition = {
  key: string;
  label: string;
  canRun: (ctx: KeyActionContext) => boolean;
  run: (ctx: KeyActionContext) => void;
};
