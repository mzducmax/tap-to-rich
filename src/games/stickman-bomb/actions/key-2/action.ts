/**
 * Key [2] — Plinko tower; ball lands in a slot and adds bet × multiplier to assets.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { KEY_2_PLINKO, canRunPlinkoKey, type KeyActionDefinition } from '../types';

export const key2PlinkoAction: KeyActionDefinition = {
  key: KEY_2_PLINKO,
  label: 'Plinko',
  canRun: canRunPlinkoKey,
  run: ({ triggerPlinko }) => triggerPlinko(),
};

/** @deprecated Use key2PlinkoAction */
export const key2GiantGoldAction = key2PlinkoAction;

/** @deprecated Use key2PlinkoAction */
export const key2BowAction = key2PlinkoAction;
