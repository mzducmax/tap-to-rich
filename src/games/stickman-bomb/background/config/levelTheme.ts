/**
 * Per-level color theme — tier ladder for frame + level badge.
 * Positive climbs rarity colors (green → cyan → blue → purple → gold),
 * negative deepens through warning oranges into dark crimson.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import type { BackgroundLevel } from './levelConfig';

export type LevelTheme = {
  /** Main accent (border, pips, glow). */
  accent: string;
  /** Deep end of the badge gradient. */
  deep: string;
  /** Translucent glow color for shadows. */
  glow: string;
  /** Badge text color. */
  text: string;
};

const LEVEL_THEMES: Record<BackgroundLevel, LevelTheme> = {
  0: {
    accent: '#94a3b8',
    deep: '#334155',
    glow: 'rgba(148, 163, 184, 0.35)',
    text: '#e2e8f0',
  },
  1: {
    accent: '#4ade80',
    deep: '#166534',
    glow: 'rgba(74, 222, 128, 0.45)',
    text: '#dcfce7',
  },
  2: {
    accent: '#22d3ee',
    deep: '#155e75',
    glow: 'rgba(34, 211, 238, 0.45)',
    text: '#cffafe',
  },
  3: {
    accent: '#60a5fa',
    deep: '#1e40af',
    glow: 'rgba(96, 165, 250, 0.5)',
    text: '#dbeafe',
  },
  4: {
    accent: '#c084fc',
    deep: '#6b21a8',
    glow: 'rgba(192, 132, 252, 0.5)',
    text: '#f3e8ff',
  },
  5: {
    accent: '#fbbf24',
    deep: '#92400e',
    glow: 'rgba(251, 191, 36, 0.55)',
    text: '#fef3c7',
  },
  '-1': {
    accent: '#fb923c',
    deep: '#7c2d12',
    glow: 'rgba(251, 146, 60, 0.45)',
    text: '#ffedd5',
  },
  '-2': {
    accent: '#ef4444',
    deep: '#7f1d1d',
    glow: 'rgba(239, 68, 68, 0.48)',
    text: '#fee2e2',
  },
  '-3': {
    accent: '#ec4899',
    deep: '#831843',
    glow: 'rgba(236, 72, 153, 0.5)',
    text: '#fce7f3',
  },
  '-4': {
    accent: '#d946ef',
    deep: '#701a75',
    glow: 'rgba(217, 70, 239, 0.52)',
    text: '#fae8ff',
  },
  '-5': {
    accent: '#8b5cf6',
    deep: '#4c1d95',
    glow: 'rgba(139, 92, 246, 0.55)',
    text: '#ede9fe',
  },
  '-6': {
    accent: '#e11d48',
    deep: '#2a0509',
    glow: 'rgba(225, 29, 72, 0.6)',
    text: '#ffe4e6',
  },
};

export function getLevelTheme(level: BackgroundLevel): LevelTheme {
  return LEVEL_THEMES[level] ?? LEVEL_THEMES[0];
}
