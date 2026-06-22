/**
 * Key [1] — drop gift box reward (+$10).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { KEY_1_BOMB, canRunGameplayKey, type KeyActionDefinition } from '../types';

export const key1BombAction: KeyActionDefinition = {
  key: KEY_1_BOMB,
  label: 'Drop gift box',
  canRun: canRunGameplayKey,
  run: ({ startBombing }) => startBombing(),
};
