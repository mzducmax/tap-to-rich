/**
 * Key [U] — tomato arcs in, splats the house, deducts money (-$20).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { KEY_U_TOMATO, canRunGameplayKey, type KeyActionDefinition } from '../types';

export const key13TomatoAction: KeyActionDefinition = {
  key: KEY_U_TOMATO,
  label: 'Tomato splat',
  canRun: canRunGameplayKey,
  run: ({ triggerTomato }) => triggerTomato(),
};
