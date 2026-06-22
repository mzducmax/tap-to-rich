/**
 * Capybara wizard sprite sheet — 5 spell-cast frames (1024×682).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import wizardSheetUrl from '../assets/capybara-wizard-sheet.png';

export const WIZARD_SPRITE_URL = wizardSheetUrl;

export const WIZARD_SHEET_W = 1024;
export const WIZARD_SHEET_H = 682;

/** Source viewport in sheet pixels — sized to the tallest cast frame. */
export const WIZARD_VIEW_W = 252;
export const WIZARD_VIEW_H = 193;

export const WIZARD_FRAME_COUNT = 5;

/** Per-frame content bounds [minX, minY, maxX, maxY] in sheet pixels. */
export const WIZARD_FRAMES: ReadonlyArray<readonly [number, number, number, number]> = [
  [60, 79, 258, 268], // 0 idle / wind-up
  [364, 78, 599, 267], // 1 channel
  [706, 78, 957, 270], // 2 release
  [219, 361, 441, 537], // 3 sweep
  [618, 377, 793, 540], // 4 recovery
];

/** Full spell cast — charge → power → blast. */
export const WIZARD_CAST_FRAMES = [0, 1, 2] as const;

/** Swirling defensive aura. */
export const WIZARD_AURA_FRAMES = [3] as const;

/** Idle concentration pose. */
export const WIZARD_IDLE_FRAMES = [4] as const;

export const WIZARD_SPRITE_DISPLAY_W = 120;
export const WIZARD_SPRITE_DISPLAY_H = Math.round(
  WIZARD_VIEW_H * (WIZARD_SPRITE_DISPLAY_W / WIZARD_VIEW_W),
);

const DISPLAY_SCALE = WIZARD_SPRITE_DISPLAY_W / WIZARD_VIEW_W;

export const WIZARD_SHEET_DISPLAY_W = Math.round(WIZARD_SHEET_W * DISPLAY_SCALE);
export const WIZARD_SHEET_DISPLAY_H = Math.round(WIZARD_SHEET_H * DISPLAY_SCALE);

export function getWizardFrameOffset(frameIndex: number): { x: number; y: number } {
  const clamped =
    ((frameIndex % WIZARD_FRAME_COUNT) + WIZARD_FRAME_COUNT) % WIZARD_FRAME_COUNT;
  const [minx, miny, maxx, maxy] = WIZARD_FRAMES[clamped];
  const cw = maxx - minx + 1;
  const ch = maxy - miny + 1;
  return {
    x: (-minx + Math.round((WIZARD_VIEW_W - cw) / 2)) * DISPLAY_SCALE,
    y: (-miny + (WIZARD_VIEW_H - ch)) * DISPLAY_SCALE,
  };
}
