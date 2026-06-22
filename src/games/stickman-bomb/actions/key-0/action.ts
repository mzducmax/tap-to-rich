/**
 * Key [0] — full-screen system hack sequence.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { KEY_0_HACKER, type KeyActionDefinition } from '../types';

export const key0HackerAction: KeyActionDefinition = {
  key: KEY_0_HACKER,
  label: 'System hack',
  canRun: ({ paused, plinkoRunning }) => !paused && !plinkoRunning,
  run: ({ triggerHackerEffect }) => triggerHackerEffect(),
};
