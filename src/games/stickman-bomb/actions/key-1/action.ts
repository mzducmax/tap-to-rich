/**
 * Key [1] — stickman carries bomb; detonation deducts $10.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { KEY_1_BOMB, canRunGameplayKey, type KeyActionDefinition } from '../types';

export const key1BombAction: KeyActionDefinition = {
  key: KEY_1_BOMB,
  label: 'Bomb',
  canRun: canRunGameplayKey,
  run: ({ startBombing }) => startBombing(),
};
