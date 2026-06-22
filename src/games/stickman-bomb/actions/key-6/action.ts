/**
 * Key [6] — roll a die on the estate; reward equals the face value.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { KEY_6_DICE_ROLL, canRunGameplayKey, type KeyActionDefinition } from '../types';

export const key6DiceRollAction: KeyActionDefinition = {
  key: KEY_6_DICE_ROLL,
  label: 'Dice roll (estate)',
  canRun: canRunGameplayKey,
  run: ({ triggerDiceRoll }) => triggerDiceRoll(),
};
