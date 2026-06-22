/**
 * Shared sheep hit score float styling.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import type { SheepVariant } from './sheepConfig';

export type SheepScoreFloatTheme = {
  color: string;
  stroke: string;
  shadow: string;
  bg: string;
  fontSize: string;
  counterFontSize: string;
  estateFontSize: string;
};

export const SHEEP_SCORE_FLOAT_THEMES: Record<SheepVariant, SheepScoreFloatTheme> = {
  white: {
    color: '#ecfccb',
    stroke: '#3f6212',
    shadow: '0 0 16px rgba(190, 242, 100, 0.85), 0 2px 0 rgba(0, 0, 0, 0.5)',
    bg: 'rgba(22, 36, 12, 0.62)',
    fontSize: '1.85rem',
    counterFontSize: '2.85rem',
    estateFontSize: '3rem',
  },
  pink: {
    color: '#fce7f3',
    stroke: '#9d174d',
    shadow: '0 0 16px rgba(244, 114, 182, 0.85), 0 2px 0 rgba(0, 0, 0, 0.5)',
    bg: 'rgba(56, 12, 36, 0.62)',
    fontSize: '2rem',
    counterFontSize: '3rem',
    estateFontSize: '3.15rem',
  },
  gold: {
    color: '#fef08a',
    stroke: '#854d0e',
    shadow: '0 0 18px rgba(250, 204, 21, 0.9), 0 2px 0 rgba(0, 0, 0, 0.5)',
    bg: 'rgba(56, 38, 8, 0.68)',
    fontSize: '2.2rem',
    counterFontSize: '3.25rem',
    estateFontSize: '3.45rem',
  },
  black: {
    color: '#fecaca',
    stroke: '#7f1d1d',
    shadow: '0 0 16px rgba(239, 68, 68, 0.85), 0 2px 0 rgba(0, 0, 0, 0.5)',
    bg: 'rgba(40, 10, 10, 0.68)',
    fontSize: '1.9rem',
    counterFontSize: '2.85rem',
    estateFontSize: '3rem',
  },
};

export function formatSheepHitLabel(delta: number): string {
  const amount = Math.abs(delta);
  return delta >= 0 ? `+${amount}$` : `-${amount}$`;
}

/** Rise + fade animation shared by hit burst and counter float. */
export const SHEEP_SCORE_RISE_ANIMATION = {
  burst: {
    initial: { y: 10, opacity: 0, scale: 0.55 },
    animate: {
      y: [10, -16, -58, -88],
      opacity: [0, 1, 1, 0],
      scale: [0.55, 1.2, 1.08, 0.94],
    },
    transition: {
      duration: 1.05,
      ease: 'easeOut' as const,
      times: [0, 0.14, 0.52, 1],
    },
  },
  counter: {
    initial: { y: 14, opacity: 0, scale: 0.5 },
    animate: {
      y: [14, -20, -72, -132],
      opacity: [0, 1, 1, 0],
      scale: [0.5, 1.28, 1.12, 0.96],
    },
    transition: {
      duration: 1.35,
      ease: 'easeOut' as const,
      times: [0, 0.12, 0.48, 1],
    },
  },
  estate: {
    initial: { y: 10, opacity: 0, scale: 0.52 },
    animate: {
      y: [10, -18, -66, -124],
      opacity: [0, 1, 1, 0],
      scale: [0.52, 1.24, 1.1, 0.94],
    },
    transition: {
      duration: 1.2,
      ease: 'easeOut' as const,
      times: [0, 0.12, 0.5, 1],
    },
  },
};
