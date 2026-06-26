/**
 * Key [i] — missile flies in from off-screen, slams into the estate and explodes.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { KEY_I_MISSILE, canRunGameplayKey, type KeyActionDefinition } from '../types';

export const key12MissileAction: KeyActionDefinition = {
  key: KEY_I_MISSILE,
  label: 'Missile strike',
  canRun: canRunGameplayKey,
  run: ({ triggerMissileStrike }) => triggerMissileStrike(),
};
