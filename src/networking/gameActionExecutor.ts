import type { GiftBoxEffect } from './giftBoxRules';
import type { GameExecuteActionData, NetworkMessage } from './types';

/**
 * Gameplay effect the canvas can trigger on demand (mirrors the keyboard
 * actions in `games/stickman-bomb/actions`). Network actions map onto these.
 */
export type GameEffectId =
  | 'hack'
  | 'bomb'
  | 'plinko'
  | 'grappleHeist'
  | 'moneyTrain'
  | 'moneySpinner'
  | 'diceRoll'
  | 'verticalLightning'
  | 'soccerBall'
  | 'trumpSpawn'
  | 'pigBank'
  | 'goldNugget'
  | 'missile'
  | 'tomato'
  | 'birdFlock';

type ActionDescriptor =
  | { kind: 'effect'; effectId: GameEffectId; name: string }
  | { kind: 'box'; direction: 'add' | 'subtract'; name: string }
  | { kind: 'win'; sign: 1 | -1; name: string }
  | { kind: 'reset'; name: string };

/**
 * Single source of truth: network `actionId` → in-game behaviour. The same
 * ids must be configured server-side in `defaultActions` (see README/config).
 * 1–13: gameplay effects · 14–16: win / reset.
 */
export const ACTION_REGISTRY: Record<number, ActionDescriptor> = {
  1: { kind: 'effect', effectId: 'hack', name: 'System hack' },
  2: { kind: 'effect', effectId: 'bomb', name: 'Bomb' },
  3: { kind: 'effect', effectId: 'plinko', name: 'Plinko' },
  4: { kind: 'effect', effectId: 'grappleHeist', name: 'Grappling hook heist' },
  5: { kind: 'effect', effectId: 'moneyTrain', name: 'Money train' },
  6: { kind: 'effect', effectId: 'moneySpinner', name: 'Money spinner' },
  7: { kind: 'effect', effectId: 'diceRoll', name: 'Dice roll' },
  8: { kind: 'effect', effectId: 'verticalLightning', name: 'Vertical lightning' },
  9: { kind: 'effect', effectId: 'soccerBall', name: 'Knife drop' },
  10: { kind: 'effect', effectId: 'trumpSpawn', name: 'Trump spawn' },
  11: { kind: 'effect', effectId: 'pigBank', name: 'Pig bank' },
  12: { kind: 'effect', effectId: 'goldNugget', name: 'Gold nugget slam' },
  13: { kind: 'effect', effectId: 'missile', name: 'Missile strike' },
  14: { kind: 'win', sign: -1, name: '- Win' },
  15: { kind: 'win', sign: 1, name: '+ Win' },
  16: { kind: 'reset', name: 'Reset' },
  17: { kind: 'effect', effectId: 'tomato', name: 'Tomato throw' },
  18: { kind: 'effect', effectId: 'birdFlock', name: 'Bird flock' },
};

/** Named ids used across the network layer. */
export const ACTION_WIN_SUBTRACT = 14;
export const ACTION_WIN_ADD = 15;
export const ACTION_RESET = 16;

/** Safety cap so a high-combo gift can't spam a single effect endlessly. */
export const MAX_EFFECT_REPEAT = 25;

export type ActionEffectOptions = {
  viewerId?: string | null;
  coins?: number;
};

export type SettingsActionResult =
  | { type: 'box'; effect: GiftBoxEffect; source?: string }
  | { type: 'reset'; viewerName: string }
  | { type: 'winDelta'; delta: number; viewerName: string }
  | { type: 'effect'; effectId: GameEffectId; repeat: number; viewerName: string };

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

  const descriptor = ACTION_REGISTRY[actionId];
  if (!descriptor) {
    console.warn('[GameAction] unsupported actionId:', actionId);
    return null;
  }

  switch (descriptor.kind) {
    case 'reset':
      return { type: 'reset', viewerName };

    case 'win':
      return {
        type: 'winDelta',
        delta: descriptor.sign * repeat * safeUnits,
        viewerName,
      };

    case 'box':
      return {
        type: 'box',
        effect: {
          direction: descriptor.direction,
          boxes: safeUnits * repeat,
          viewerName,
          viewerId: options.viewerId ?? null,
          coins: options.coins,
        },
      };

    case 'effect':
      return {
        type: 'effect',
        effectId: descriptor.effectId,
        repeat: Math.min(MAX_EFFECT_REPEAT, safeUnits * repeat),
        viewerName,
      };
  }
}

export function resolveGameExecuteEffects(data: GameExecuteActionData): SettingsActionResult[] {
  const viewerName = data.userInfo?.name?.trim() || 'Live Action';
  const result = resolveSettingsAction(
    data.actionId,
    data.units,
    data.number,
    viewerName,
  );
  return result ? [result] : [];
}
