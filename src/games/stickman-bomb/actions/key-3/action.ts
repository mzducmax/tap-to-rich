/**
 * Key [3] — avatar strike action.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { KEY_3_AVATAR_STRIKE, canRunGameplayKey, type KeyActionDefinition } from '../types';

export const key3AvatarStrikeAction: KeyActionDefinition = {
  key: KEY_3_AVATAR_STRIKE,
  label: 'Avatar strike',
  canRun: canRunGameplayKey,
  run: ({ triggerAvatarStrike }) => triggerAvatarStrike(),
};
