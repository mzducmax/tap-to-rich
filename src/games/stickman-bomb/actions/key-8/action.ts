/**
 * Key [8] — a knife falls from the sky and plants at a random spot.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { KEY_8_SOCCER_BALL, canRunGameplayKey, type KeyActionDefinition } from '../types';

export const key8SoccerBallAction: KeyActionDefinition = {
  key: KEY_8_SOCCER_BALL,
  label: 'Knife drop',
  canRun: canRunGameplayKey,
  run: ({ triggerSoccerBallKick }) => triggerSoccerBallKick(),
};
