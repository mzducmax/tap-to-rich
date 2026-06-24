/**
 * Key [P] — golden pig bank descends, money piles up (+$1000).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { KEY_P_PIG_BANK, canRunGameplayKey, type KeyActionDefinition } from '../types';

export const keyPPigBankAction: KeyActionDefinition = {
  key: KEY_P_PIG_BANK,
  label: 'Pig bank',
  canRun: canRunGameplayKey,
  run: ({ triggerPigBank }) => triggerPigBank(),
};
