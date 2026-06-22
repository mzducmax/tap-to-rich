/**
 * Estate tier images — lv0–lv5 (positive), lv-1–lv-6 (negative).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import estateIslandUrl from '../assets/island.png';
import estateNeg1Url from '../../background/assets/house/lv-1.png';
import estateNeg2Url from '../../background/assets/house/lv-2.png';
import estateNeg3Url from '../../background/assets/house/lv-3.png';
import estateNeg4Url from '../../background/assets/house/lv-4.png';
import estateNeg5Url from '../../background/assets/house/lv-5.png';
import estateNeg6Url from '../../background/assets/house/lv-6.png';
import estate0Url from '../../background/assets/house/lv0.png';
import estate1Url from '../../background/assets/house/lv1.png';
import estate2Url from '../../background/assets/house/lv2.png';
import estate3Url from '../../background/assets/house/lv3.png';
import estate4Url from '../../background/assets/house/lv4.png';
import estate5Url from '../../background/assets/house/lv5.png';
import {
  scoreToBackgroundLevel,
  type BackgroundLevel,
} from '../../background/config/levelConfig';

export type EstateLevel = BackgroundLevel;

/** Fixed floating island pedestal under the estate building */
export const ESTATE_ISLAND_URL = estateIslandUrl;

export const POSITIVE_ESTATE_LEVELS: EstateLevel[] = [0, 1, 2, 3, 4, 5];
export const NEGATIVE_ESTATE_LEVELS: EstateLevel[] = [-1, -2, -3, -4, -5, -6];

const POSITIVE_URLS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: estate1Url,
  2: estate2Url,
  3: estate3Url,
  4: estate4Url,
  5: estate5Url,
};

const NEGATIVE_URLS: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
  1: estateNeg1Url,
  2: estateNeg2Url,
  3: estateNeg3Url,
  4: estateNeg4Url,
  5: estateNeg5Url,
  6: estateNeg6Url,
};

export function getDefaultEstateImageUrl(level: EstateLevel): string {
  if (level === 0) return estate0Url;
  if (level > 0) return POSITIVE_URLS[level];
  return NEGATIVE_URLS[Math.abs(level) as 1 | 2 | 3 | 4 | 5 | 6];
}

export function getEstateImageUrl(
  level: EstateLevel,
  overrides?: Partial<Record<EstateLevel, string>>,
): string {
  const custom = overrides?.[level];
  if (custom) return custom;
  return getDefaultEstateImageUrl(level);
}

export function scoreToEstateLevel(
  score: number,
  targetScore: number,
): EstateLevel {
  return scoreToBackgroundLevel(score, targetScore);
}

/** Levels whose building art sits low — nudge up slightly on the island. */
export const ESTATE_LEVELS_SEAT_UP: readonly EstateLevel[] = [3, 4, 5];

export function estateNeedsSeatUp(level: EstateLevel): boolean {
  return (ESTATE_LEVELS_SEAT_UP as readonly number[]).includes(level);
}
