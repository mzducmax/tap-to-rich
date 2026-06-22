/**
 * Aggregated key actions for keys 0–9.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { key0HackerAction } from './key-0/action';
import { key1BombAction } from './key-1/action';
import { key2PlinkoAction } from './key-2/action';
import { key3AvatarStrikeAction } from './key-3/action';
import { key4AvatarCoinAction } from './key-4/action';
import { key5DivineCrossbowAction } from './key-5/action';
import { key6DiceRollAction } from './key-6/action';
import { key7VerticalLightningAction } from './key-7/action';
import { key8SoccerBallAction } from './key-8/action';
import { key9TrumpSpawnAction } from './key-9/action';
import type { KeyActionDefinition } from './types';

export const keyActions: KeyActionDefinition[] = [
  key0HackerAction,
  key1BombAction,
  key2PlinkoAction,
  key3AvatarStrikeAction,
  key4AvatarCoinAction,
  key5DivineCrossbowAction,
  key6DiceRollAction,
  key7VerticalLightningAction,
  key8SoccerBallAction,
  key9TrumpSpawnAction,
];
