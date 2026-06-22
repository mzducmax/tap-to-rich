/**
 * Key [9] — Trump box spawn with money zigzag + camera zoom.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { KEY_9_TRUMP_SPAWN, canRunGameplayKey, type KeyActionDefinition } from '../types';

export const key9TrumpSpawnAction: KeyActionDefinition = {
  key: KEY_9_TRUMP_SPAWN,
  label: 'Trump spawn',
  canRun: canRunGameplayKey,
  run: ({ triggerTrumpSpawn }) => triggerTrumpSpawn(),
};
