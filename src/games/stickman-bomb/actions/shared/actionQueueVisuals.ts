/**
 * Display metadata for action spawn queue avatars — cached + preloaded.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { hackerUrl } from '../key-0/config/hackerAssets';
import { divineCrossbowUrl } from '../key-5/config/divineCrossbowAssets';
import { footballUrl } from '../key-8/config/soccerBallAssets';
import { trumpUrl } from '../key-9/config/trumpAssets';
import { pigUrl } from '../key-10/config/pigBankAssets';
import stormCloudUrl from '../key-7/assets/storm-cloud.png';
import {
  KEY_0_HACKER,
  KEY_1_BOMB,
  KEY_2_PLINKO,
  KEY_2_BOW,
  KEY_3_AVATAR_STRIKE,
  KEY_4_AVATAR_COIN,
  KEY_5_AVATAR_BUBBLE,
  KEY_6_DICE_ROLL,
  KEY_7_VERTICAL_LIGHTNING,
  KEY_8_SOCCER_BALL,
  KEY_9_TRUMP_SPAWN,
  KEY_P_PIG_BANK,
  KEY_O_BUTTERFLY,
} from '../types';

export type ActionQueueVisual = {
  key: string;
  label: string;
  emoji: string;
  imageUrl?: string;
};

const STATIC_VISUALS: Record<string, Omit<ActionQueueVisual, 'key'>> = {
  [KEY_0_HACKER]: { label: 'Hack', emoji: '💻', imageUrl: hackerUrl },
  [KEY_1_BOMB]: { label: 'Gift', emoji: '🎁' },
  [KEY_2_PLINKO]: { label: 'Plinko', emoji: '🎯' },
  [KEY_3_AVATAR_STRIKE]: { label: 'Strike', emoji: '🎯' },
  [KEY_4_AVATAR_COIN]: { label: 'Coin', emoji: '🪙' },
  [KEY_5_AVATAR_BUBBLE]: { label: 'Crossbow', emoji: '✨', imageUrl: divineCrossbowUrl },
  [KEY_6_DICE_ROLL]: { label: 'Dice', emoji: '🎲' },
  [KEY_7_VERTICAL_LIGHTNING]: { label: 'Lightning', emoji: '⚡', imageUrl: stormCloudUrl },
  [KEY_8_SOCCER_BALL]: { label: 'Soccer', emoji: '⚽', imageUrl: footballUrl },
  [KEY_9_TRUMP_SPAWN]: { label: 'Trump', emoji: '💵', imageUrl: trumpUrl },
  [KEY_P_PIG_BANK]: { label: 'Pig bank', emoji: '🐷', imageUrl: pigUrl },
  [KEY_O_BUTTERFLY]: { label: 'Gold nugget', emoji: '🪙' },
};

const visualCache = new Map<string, ActionQueueVisual>();
const preloaded = new Set<string>();

function preloadImage(url: string) {
  if (preloaded.has(url)) return;
  preloaded.add(url);
  const img = new Image();
  img.decoding = 'async';
  img.src = url;
}

for (const entry of Object.values(STATIC_VISUALS)) {
  if (entry.imageUrl) preloadImage(entry.imageUrl);
}

export function getActionQueueVisual(
  actionKey: string,
  avatarUrl?: string,
): ActionQueueVisual {
  const trimmedAvatar = avatarUrl?.trim();
  const useAvatar =
    (actionKey === KEY_3_AVATAR_STRIKE || actionKey === KEY_4_AVATAR_COIN) &&
    trimmedAvatar;

  const cacheKey = useAvatar ? `${actionKey}:${trimmedAvatar}` : actionKey;
  const cached = visualCache.get(cacheKey);
  if (cached) return cached;

  const base = STATIC_VISUALS[actionKey];
  if (!base) {
    const fallback = { key: actionKey, label: actionKey, emoji: '❓' };
    visualCache.set(cacheKey, fallback);
    return fallback;
  }

  const visual: ActionQueueVisual = {
    key: actionKey,
    ...base,
    imageUrl: useAvatar ? trimmedAvatar : base.imageUrl,
  };

  if (visual.imageUrl) preloadImage(visual.imageUrl);
  visualCache.set(cacheKey, visual);
  return visual;
}
