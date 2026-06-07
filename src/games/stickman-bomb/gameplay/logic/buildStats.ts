/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { GameStats } from '../../../../types';

export function buildStats(score: number, perfectStreak = 0): GameStats {
  const highScore = Number(localStorage.getItem('stack_high_score') || 0);
  const nextHigh = Math.max(highScore, score);
  if (nextHigh > highScore) {
    localStorage.setItem('stack_high_score', String(nextHigh));
  }
  return {
    score,
    highScore: nextHigh,
    perfectStreak,
    totalBoxesStacked: Math.max(1, score),
  };
}
