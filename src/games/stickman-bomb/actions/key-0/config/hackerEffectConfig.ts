/**
 * Key [0] — system hack sequence (matrix rain, alert, money drain).
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const HACKER_PENALTY = 20000;
export const HACKER_COOLDOWN_MS = 4200;
export const HACKER_MAX_CONCURRENT = 1;

/** Fade + glitch bridge — game screen ↔ hacker overlay. */
export const HACKER_ENTER_MS = 320;
export const HACKER_EXIT_MS = 300;

/** Matrix rain + terminal scroll phase. */
export const HACKER_MATRIX_MS = 600;

/** Alert + hacker image hold before camera zoom. */
export const HACKER_ALERT_MS = 850;

/** Continuous drain duration toward HACKER_PENALTY. */
export const HACKER_DRAIN_MS = 3800;

/** Estate reveal — zoom toward house in gameplay stage. */
export const HACKER_ESTATE_ZOOM_IN = 2.2;
export const HACKER_ESTATE_ZOOM_IN_MS = 380;
export const HACKER_ESTATE_HOLD_MS = 220;
export const HACKER_ESTATE_ZOOM_OUT_MS = 340;

/** Bottom balance panel zoom (outside camera stage). */
export const HACKER_PANEL_ZOOM_IN = 2.45;
export const HACKER_PANEL_ZOOM_IN_MS = 360;
export const HACKER_PANEL_ZOOM_OUT_MS = 420;

/** @deprecated use HACKER_ESTATE_ZOOM_IN */
export const HACKER_CAMERA_ZOOM_IN = HACKER_ESTATE_ZOOM_IN;
export const HACKER_CAMERA_ZOOM_IN_MS = HACKER_ESTATE_ZOOM_IN_MS;
export const HACKER_CAMERA_ZOOM_OUT_MS = HACKER_ESTATE_ZOOM_OUT_MS;

/** Canvas performance caps. */
export const HACKER_MATRIX_DPR = 1.25;
export const HACKER_MATRIX_FONT_PX = 13;
export const HACKER_MATRIX_COLUMN_PX = 14;
export const HACKER_MATRIX_TRAIL_ALPHA = 0.09;

export const HACKER_OVERLAY_Z = 70;

/** Safety cap — force teardown if the sequence stalls. */
export const HACKER_MAX_DURATION_MS = 14_000;