/**
 * Target score limits and helpers (supports negative targets).
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const MIN_TARGET_SCORE = -999_999_999;
export const MAX_TARGET_SCORE = 999_999_999;
export const DEFAULT_TARGET_SCORE = 100;

export function clampTargetScore(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_TARGET_SCORE;
  return Math.max(MIN_TARGET_SCORE, Math.min(MAX_TARGET_SCORE, Math.trunc(value)));
}

export function loadTargetScore(): number {
  const saved = localStorage.getItem('stack_target_score');
  if (saved === null || saved === '') return DEFAULT_TARGET_SCORE;
  return clampTargetScore(parseInt(saved, 10));
}

export function saveTargetScore(value: number) {
  localStorage.setItem('stack_target_score', String(clampTargetScore(value)));
}

/** Score range while playing — symmetric floor/ceiling when target is positive. */
export function getScoreBounds(targetScore: number): { floor: number; ceiling: number } {
  const target = clampTargetScore(targetScore);
  if (target > 0) {
    return { floor: -target, ceiling: target };
  }
  if (target < 0) {
    return { floor: target, ceiling: 0 };
  }
  return { floor: -DEFAULT_TARGET_SCORE, ceiling: 0 };
}

export function clampScoreToBounds(score: number, targetScore: number): number {
  const { floor, ceiling } = getScoreBounds(targetScore);
  return Math.max(floor, Math.min(ceiling, score));
}

/** Negative score threshold that triggers defeat. */
export function getLoseTargetScore(targetScore: number): number {
  const target = clampTargetScore(targetScore);
  if (target < 0) return target;
  if (target > 0) return -target;
  return -DEFAULT_TARGET_SCORE;
}

export function hasReachedWinTarget(score: number, targetScore: number): boolean {
  const target = clampTargetScore(targetScore);
  return target > 0 && score >= target;
}

export function hasReachedLoseTarget(score: number, targetScore: number): boolean {
  return score <= getLoseTargetScore(targetScore);
}

/** @deprecated use hasReachedWinTarget */
export function hasReachedTarget(score: number, targetScore: number): boolean {
  return hasReachedWinTarget(score, targetScore);
}

function getProgressReference(targetScore: number): number {
  const target = clampTargetScore(targetScore);
  return Math.abs(target) || DEFAULT_TARGET_SCORE;
}

export function getTargetProgressPercent(score: number, targetScore: number): number {
  const target = clampTargetScore(targetScore);
  if (target === 0) return score === 0 ? 100 : 0;
  if (target > 0) {
    if (score <= 0) return 0;
    return Math.min(100, (score / getProgressReference(targetScore)) * 100);
  }
  return getNegativeProgressPercent(score, targetScore);
}

/** Symmetric left bar from 0 — fills right-to-left as score drops below 0. */
export function getNegativeProgressPercent(
  score: number,
  targetScore: number,
): number {
  if (score >= 0) return 0;
  const ref = getProgressReference(targetScore);
  return Math.min(100, (Math.abs(score) / ref) * 100);
}

/** Symmetric right bar from 0 — fills left-to-right as score rises above 0. */
export function getPositiveProgressPercent(
  score: number,
  targetScore: number,
): number {
  if (score <= 0) return 0;
  const ref = getProgressReference(targetScore);
  return Math.min(100, (score / ref) * 100);
}
