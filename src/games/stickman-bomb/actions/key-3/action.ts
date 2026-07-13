/**
 * Key [3] — grappling-hook money heist action.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { KEY_3_AVATAR_STRIKE, canRunGameplayKey, type KeyActionDefinition } from '../types';

export const key3AvatarStrikeAction: KeyActionDefinition = {
  key: KEY_3_AVATAR_STRIKE,
  label: 'Grappling hook heist',
  canRun: canRunGameplayKey,
  run: ({ triggerAvatarStrike }) => triggerAvatarStrike(),
};
