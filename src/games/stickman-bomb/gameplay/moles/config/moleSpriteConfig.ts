/**
 * Mouse whack-a-mole sprite sheet — 7 pop-up frames in one row.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import mouseSheetUrl from '../assets/mouse-sheet.png';
import mickyAvatarUrl from '../assets/micky-avatar.png';

export const MOLE_SPRITE_URL = mouseSheetUrl;
export const MICKY_AVATAR_URL = mickyAvatarUrl;

export const MOLE_SHEET_W = 1024;
export const MOLE_SHEET_H = 341;
export const MOLE_FRAME_COUNT = 7;

export const MOLE_RISE_FRAMES = [0, 1, 2, 3, 4, 5, 6] as const;
export const MOLE_DOWN_FRAMES = [6, 5, 4, 3, 2, 1, 0] as const;

/** Display height per mole — large enough to whack reliably. */
export const MOLE_SPRITE_DISPLAY_H = 118;
const DISPLAY_SCALE = MOLE_SPRITE_DISPLAY_H / MOLE_SHEET_H;

/** Keep fractional width to avoid frame drift across the sheet. */
export const MOLE_SPRITE_DISPLAY_W = (MOLE_SHEET_W / MOLE_FRAME_COUNT) * DISPLAY_SCALE;
export const MOLE_SHEET_DISPLAY_W = MOLE_SPRITE_DISPLAY_W * MOLE_FRAME_COUNT;
export const MOLE_SHEET_DISPLAY_H = MOLE_SPRITE_DISPLAY_H;

/** CSS background-position X for an equal-width horizontal strip (0 … 100%). */
export function getMoleFrameBackgroundPosition(frameIndex: number): string {
  const clamped =
    ((frameIndex % MOLE_FRAME_COUNT) + MOLE_FRAME_COUNT) % MOLE_FRAME_COUNT;
  if (MOLE_FRAME_COUNT <= 1) return '0% 0';
  const xPercent = (clamped / (MOLE_FRAME_COUNT - 1)) * 100;
  return `${xPercent}% 0`;
}

export const MOLE_SPRITE_BACKGROUND_SIZE = `${MOLE_FRAME_COUNT * 100}% 100%`;
