import type { GiftBoxEffect } from './giftBoxRules';
import type { GameExecuteActionData, NetworkMessage } from './types';

export const ACTION_ADD_BOX = 1;
export const ACTION_SUBTRACT_BOX = 2;
export const ACTION_RESET = 3;
export const ACTION_WIN_ADD = 4;
export const ACTION_WIN_SUBTRACT = 5;

export type ActionEffectOptions = {
  viewerId?: string | null;
  coins?: number;
};

export type SettingsActionResult =
  | { type: 'box'; effect: GiftBoxEffect; source?: string }
  | { type: 'reset'; viewerName: string }
  | { type: 'winDelta'; delta: number; viewerName: string };

export function parseGameExecuteAction(msg: NetworkMessage): GameExecuteActionData | null {
  const raw = (msg.data ?? msg.payload ?? msg) as Record<string, unknown>;
  const actionId = Number(raw.actionId);
  if (!Number.isFinite(actionId)) return null;

  return {
    actionId: Math.floor(actionId),
    number: Math.max(1, Math.floor(Number(raw.number) || 1)),
    units: Math.max(1, Math.floor(Number(raw.units) || 1)),
    userInfo: raw.userInfo as GameExecuteActionData['userInfo'],
  };
}

export function resolveActionEffect(
  actionId: number,
  units: number,
  viewerName: string,
  options: ActionEffectOptions = {},
): GiftBoxEffect | null {
  const result = resolveSettingsAction(actionId, units, 1, viewerName, options);
  return result?.type === 'box' ? result.effect : null;
}

/** One settings action (gift / like / game_execute_action). */
export function resolveSettingsAction(
  actionId: number,
  units: number,
  number: number,
  viewerName: string,
  options: ActionEffectOptions = {},
): SettingsActionResult | null {
  const safeUnits = Math.max(1, Math.floor(units) || 1);
  const repeat = Math.max(1, Math.floor(number) || 1);

  if (actionId === ACTION_RESET) {
    return { type: 'reset', viewerName };
  }

  if (actionId === ACTION_WIN_ADD) {
    return { type: 'winDelta', delta: repeat * safeUnits, viewerName };
  }

  if (actionId === ACTION_WIN_SUBTRACT) {
    return { type: 'winDelta', delta: -repeat * safeUnits, viewerName };
  }

  const totalBoxes = safeUnits * repeat;

  if (actionId === ACTION_ADD_BOX) {
    return {
      type: 'box',
      effect: {
        direction: 'add',
        boxes: totalBoxes,
        viewerName,
        viewerId: options.viewerId ?? null,
        coins: options.coins,
      },
    };
  }

  if (actionId === ACTION_SUBTRACT_BOX) {
    return {
      type: 'box',
      effect: {
        direction: 'subtract',
        boxes: totalBoxes,
        viewerName,
        viewerId: options.viewerId ?? null,
        coins: options.coins,
      },
    };
  }

  console.warn('[GameAction] unsupported actionId:', actionId);
  return null;
}

export function resolveGameExecuteEffects(data: GameExecuteActionData): SettingsActionResult[] {
  const viewerName = data.userInfo?.name?.trim() || 'Live Action';
  const results: SettingsActionResult[] = [];

  if (data.actionId === ACTION_RESET) {
    const once = resolveSettingsAction(data.actionId, data.units, 1, viewerName);
    if (once) results.push(once);
    return results;
  }

  if (data.actionId === ACTION_WIN_ADD || data.actionId === ACTION_WIN_SUBTRACT) {
    const win = resolveSettingsAction(
      data.actionId,
      data.units,
      data.number,
      viewerName,
    );
    if (win) results.push(win);
    return results;
  }

  const box = resolveSettingsAction(
    data.actionId,
    data.units,
    data.number,
    viewerName,
  );
  if (box) results.push(box);

  return results;
}
