/**
 * Capybara sprite sheet — non-uniform frames (1024×682), measured from source art.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import capybaraSheetUrl from '../assets/capybara-sheet.png';

export const CAPYBARA_SPRITE_URL = capybaraSheetUrl;

export const CAPYBARA_SHEET_W = 1024;
export const CAPYBARA_SHEET_H = 682;

/** Source viewport in sheet pixels — sized to the walk-cycle bounding box. */
export const CAPYBARA_VIEW_W = 178;
export const CAPYBARA_VIEW_H = 90;

export const CAPYBARA_FRAME_COUNT = 13;

/** Per-frame content bounds [minX, minY, maxX, maxY] in sheet pixels. */
export const CAPYBARA_FRAMES: ReadonlyArray<readonly [number, number, number, number]> = [
  [80, 141, 232, 230], // 0 walk
  [258, 147, 435, 230], // 1 walk
  [475, 146, 627, 230], // 2 walk
  [671, 144, 774, 230], // 3 sit
  [816, 157, 931, 230], // 4 scratch
  [115, 316, 253, 381], // 5 lie
  [296, 320, 453, 382], // 6 sleep
  [512, 289, 616, 382], // 7 sit forward
  [661, 304, 782, 382], // 8 scratch face
  [842, 304, 919, 386], // 9 rear
  [103, 467, 278, 523], // 10 swim
  [296, 464, 460, 526], // 11 swim
  [498, 448, 668, 532], // 12 shake off water
];

/** Walk cycle — row 0, frames 0–2. */
export const CAPYBARA_WALK_FRAMES = [0, 1, 2] as const;

/** Idle look — sit + sit forward. */
export const CAPYBARA_IDLE_FRAMES = [3, 7] as const;

export const CAPYBARA_SPRITE_DISPLAY_W = 120;
export const CAPYBARA_SPRITE_DISPLAY_H = Math.round(
  CAPYBARA_VIEW_H * (CAPYBARA_SPRITE_DISPLAY_W / CAPYBARA_VIEW_W),
);

const DISPLAY_SCALE = CAPYBARA_SPRITE_DISPLAY_W / CAPYBARA_VIEW_W;

export const CAPYBARA_SHEET_DISPLAY_W = Math.round(CAPYBARA_SHEET_W * DISPLAY_SCALE);
export const CAPYBARA_SHEET_DISPLAY_H = Math.round(CAPYBARA_SHEET_H * DISPLAY_SCALE);

export function getCapybaraFrameOffset(frameIndex: number): { x: number; y: number } {
  const clamped =
    ((frameIndex % CAPYBARA_FRAME_COUNT) + CAPYBARA_FRAME_COUNT) % CAPYBARA_FRAME_COUNT;
  const [minx, miny, maxx, maxy] = CAPYBARA_FRAMES[clamped];
  const cw = maxx - minx + 1;
  const ch = maxy - miny + 1;
  return {
    x: (-minx + Math.round((CAPYBARA_VIEW_W - cw) / 2)) * DISPLAY_SCALE,
    y: (-miny + (CAPYBARA_VIEW_H - ch)) * DISPLAY_SCALE,
  };
}
