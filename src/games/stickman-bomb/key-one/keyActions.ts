/**
 * Key action definitions for stickman attacks.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { KEY_1_BOMB, KEY_2_BOW, type KeyActionDefinition } from './types';

export const key1BombAction: KeyActionDefinition = {
  key: KEY_1_BOMB,
  label: 'Plant bomb',
  canRun: () => true,
  run: ({ startBombing }) => startBombing(),
};

export const key2BowAction: KeyActionDefinition = {
  key: KEY_2_BOW,
  label: 'Bow attack',
  canRun: () => true,
  run: ({ startBowAttack }) => startBowAttack(),
};

export const keyActions: KeyActionDefinition[] = [key1BombAction, key2BowAction];
