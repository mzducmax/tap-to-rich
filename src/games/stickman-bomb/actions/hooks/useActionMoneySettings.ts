/**
 * Load/save editable per-action money amounts.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useState } from 'react';
import { clampActionMoney, type ActionMoneyOverrides } from '../config/actionMoneyConfig';
import {
  loadActionMoneyOverrides,
  saveActionMoneyOverrides,
} from '../config/actionMoneySettings';

export function useActionMoneySettings() {
  const [actionMoneyOverrides, setActionMoneyOverrides] = useState<ActionMoneyOverrides>(
    () => loadActionMoneyOverrides(),
  );

  const setActionMoney = useCallback((actionId: number, amount: number) => {
    setActionMoneyOverrides((prev) => {
      const next = { ...prev, [actionId]: clampActionMoney(amount) };
      saveActionMoneyOverrides(next);
      return next;
    });
  }, []);

  const resetActionMoney = useCallback((actionId: number) => {
    setActionMoneyOverrides((prev) => {
      if (prev[actionId] == null) return prev;
      const next = { ...prev };
      delete next[actionId];
      saveActionMoneyOverrides(next);
      return next;
    });
  }, []);

  const resetAllActionMoney = useCallback(() => {
    setActionMoneyOverrides({});
    saveActionMoneyOverrides({});
  }, []);

  return {
    actionMoneyOverrides,
    setActionMoney,
    resetActionMoney,
    resetAllActionMoney,
  };
}
