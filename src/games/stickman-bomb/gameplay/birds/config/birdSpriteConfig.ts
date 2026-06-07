/**
 * Duck fly sprite — ducks-img.png, 7 non-uniform frames on one row.
 * Frame coords measured from source; viewport centers each frame (HTML demo).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import duckSpriteUrl from '../../ducks-img.png';

export const DUCK_SPRITE_URL = duckSpriteUrl;

export const DUCK_SHEET_W = 1536;
export const DUCK_SHEET_H = 1024;

/** Source viewport in sheet pixels (from ai_studio_code demo). */
export const DUCK_VIEW_W = 170;
export const DUCK_VIEW_H = 125;

export const DUCK_FRAME_COUNT = 7;

/** Per-frame content bounds [minX, minY, maxX, maxY] in sheet pixels. */
export const DUCK_FRAMES: ReadonlyArray<readonly [number, number, number, number]> = [
  [24, 508, 170, 552],
  [327, 509, 475, 573],
  [558, 475, 697, 555],
  [791, 447, 939, 555],
  [1051, 476, 1187, 554],
  [1237, 509, 1370, 569],
  [1404, 511, 1526, 565],
];

/** On-screen viewport size before `--bird-scale`. */
export const BIRD_SPRITE_DISPLAY_W = 96;
export const BIRD_SPRITE_DISPLAY_H = Math.round(
  DUCK_VIEW_H * (BIRD_SPRITE_DISPLAY_W / DUCK_VIEW_W),
);

const DISPLAY_SCALE = BIRD_SPRITE_DISPLAY_W / DUCK_VIEW_W;

export const DUCK_SHEET_DISPLAY_W = Math.round(DUCK_SHEET_W * DISPLAY_SCALE);
export const DUCK_SHEET_DISPLAY_H = Math.round(DUCK_SHEET_H * DISPLAY_SCALE);

export function getDuckFrameOffset(index: number): { x: number; y: number } {
  const clamped =
    ((index % DUCK_FRAME_COUNT) + DUCK_FRAME_COUNT) % DUCK_FRAME_COUNT;
  const [minx, miny, maxx, maxy] = DUCK_FRAMES[clamped];
  const cw = maxx - minx + 1;
  const ch = maxy - miny + 1;
  return {
    x: (-minx + Math.round((DUCK_VIEW_W - cw) / 2)) * DISPLAY_SCALE,
    y: (-miny + Math.round((DUCK_VIEW_H - ch) / 2)) * DISPLAY_SCALE,
  };
}
