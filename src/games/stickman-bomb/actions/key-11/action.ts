/**
 * Key [O] — gold nugget arcs in, slams the house, gold burst (+$20).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { KEY_O_BUTTERFLY, canRunGameplayKey, type KeyActionDefinition } from '../types';

export const key11ButterflyAction: KeyActionDefinition = {
  key: KEY_O_BUTTERFLY,
  label: 'Gold nugget slam',
  canRun: canRunGameplayKey,
  run: ({ triggerButterfly }) => triggerButterfly(),
};
