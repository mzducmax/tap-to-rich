/**
 * Key [8] — soccer ball kicked from off-screen, bounces on the estate.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { KEY_8_SOCCER_BALL, canRunGameplayKey, type KeyActionDefinition } from '../types';

export const key8SoccerBallAction: KeyActionDefinition = {
  key: KEY_8_SOCCER_BALL,
  label: 'Soccer ball kick',
  canRun: canRunGameplayKey,
  run: ({ triggerSoccerBallKick }) => triggerSoccerBallKick(),
};
