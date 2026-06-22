/**
 * Key [5] — divine crossbow at bottom center fires bolts at the estate.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { KEY_5_AVATAR_BUBBLE, canRunGameplayKey, type KeyActionDefinition } from '../types';

export const key5DivineCrossbowAction: KeyActionDefinition = {
  key: KEY_5_AVATAR_BUBBLE,
  label: 'Divine crossbow',
  canRun: canRunGameplayKey,
  run: ({ triggerDivineCrossbow }) => triggerDivineCrossbow(),
};

/** @deprecated Use key5DivineCrossbowAction */
export const key5AvatarBubbleAction = key5DivineCrossbowAction;
