/**
 * Key [5] — money spinner prize wheel; the landed tier is credited to the
 * estate when the spin settles.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { KEY_5_MONEY_SPINNER, canRunGameplayKey, type KeyActionDefinition } from '../types';

export const key5MoneySpinnerAction: KeyActionDefinition = {
  key: KEY_5_MONEY_SPINNER,
  label: 'Money spinner',
  canRun: canRunGameplayKey,
  run: ({ triggerMoneySpinner }) => triggerMoneySpinner(),
};
