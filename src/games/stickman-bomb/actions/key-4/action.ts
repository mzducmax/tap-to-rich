/**
 * Key [4] — money train drops coins over the estate.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { KEY_4_AVATAR_COIN, canRunGameplayKey, type KeyActionDefinition } from '../types';

export const key4AvatarCoinAction: KeyActionDefinition = {
  key: KEY_4_AVATAR_COIN,
  label: 'Money train',
  canRun: canRunGameplayKey,
  run: ({ triggerAvatarCoin }) => triggerAvatarCoin(),
};
