/**
 * Key [7] — vertical lightning bolts striking down on the estate.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { KEY_7_VERTICAL_LIGHTNING, canRunGameplayKey, type KeyActionDefinition } from '../types';

export const key7VerticalLightningAction: KeyActionDefinition = {
  key: KEY_7_VERTICAL_LIGHTNING,
  label: 'Vertical lightning',
  canRun: canRunGameplayKey,
  run: ({ triggerVerticalLightning }) => triggerVerticalLightning(),
};
