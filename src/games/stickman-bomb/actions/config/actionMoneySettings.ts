/**
 * Per-action money overrides (signed amounts in localStorage), keyed by actionId.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import {
  clampActionMoney,
  FIXED_MONEY_ACTION_IDS,
  type ActionMoneyOverrides,
} from './actionMoneyConfig';

export const ACTION_MONEY_OVERRIDES_STORAGE_KEY = 'stack_action_money_overrides';

export type { ActionMoneyOverrides };

export function loadActionMoneyOverrides(): ActionMoneyOverrides {
  try {
    const raw = localStorage.getItem(ACTION_MONEY_OVERRIDES_STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const overrides: ActionMoneyOverrides = {};

    for (const [key, value] of Object.entries(parsed)) {
      const actionId = Number(key);
      if (!FIXED_MONEY_ACTION_IDS.includes(actionId)) continue;
      if (typeof value !== 'number' || !Number.isFinite(value)) continue;
      overrides[actionId] = clampActionMoney(value);
    }

    return overrides;
  } catch {
    return {};
  }
}

export function saveActionMoneyOverrides(overrides: ActionMoneyOverrides) {
  const payload: Record<string, number> = {};
  for (const actionId of FIXED_MONEY_ACTION_IDS) {
    const value = overrides[actionId];
    if (value != null && Number.isFinite(value)) {
      payload[String(actionId)] = clampActionMoney(value);
    }
  }
  localStorage.setItem(ACTION_MONEY_OVERRIDES_STORAGE_KEY, JSON.stringify(payload));
}

export function hasActionMoneyOverride(
  actionId: number,
  overrides: ActionMoneyOverrides,
): boolean {
  return overrides[actionId] != null;
}
