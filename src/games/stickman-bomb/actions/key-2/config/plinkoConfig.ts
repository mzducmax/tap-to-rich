/**
 * Plinko board tuning (key 2).
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const PLINKO_ROWS = 16;
export const PLINKO_SLOT_COUNT = PLINKO_ROWS + 1;

/** High-risk multiplier row (symmetrical). Center values boosted vs original. */
export const PLINKO_MULTIPLIERS: readonly number[] = [
  3200, 190, 18, 8, 5, 2, 1, 0.8, 0.5, 0.8, 1, 2, 5, 8, 18, 190, 3200,
];

/** Light repel from 0.5× core — shifts mass out of grey slots while staying monotonic. */
export const PLINKO_CENTER_REPEL = 0.085;
/** Projected drift span where core repel applies. */
export const PLINKO_CENTER_REPEL_DRIFT = 1.35;
/** Drift treated as exact center before tapering repel. */
export const PLINKO_CENTER_REPEL_CORE = 0.3;
/** Outward nudge once path clears the grey 0.5–1× band. */
export const PLINKO_MID_DRIFT = 1.925;
/** Outward mid-band bias — raised from 0.18 so high-value slots (≥2×) gain landing share (~34.6% → ~38.5%). */
export const PLINKO_MID_BIAS = 0.32;
export const PLINKO_MID_DEPTH = 0.055;
/** Depth span before mid-band pull reaches full strength. */
export const PLINKO_MID_RAMP = 2.1;
export const PLINKO_MID_BIAS_MAX = 0.43;
/** Push past 0.8× toward 2× — transfers ~2% from 0.8 landing paths. */
export const PLINKO_TRANSFER_DRIFT_START = 1.15;
export const PLINKO_TRANSFER_DRIFT_END = 1.9;
export const PLINKO_TRANSFER_BIAS = 0.075;
export const PLINKO_TRANSFER_BIAS_MAX = 0.13;
export const PLINKO_TRANSFER_DEPTH = 0.08;
/** Outward nudge strength in the jackpot tier (190× / 3200×). */
export const PLINKO_EDGE_BIAS = 0.36;
/** Max outward nudge at the deepest jackpot approach. */
export const PLINKO_EDGE_BIAS_MAX = 0.58;
/** Projected drift before jackpot outward nudge (190× / 3200× only). */
export const PLINKO_JACKPOT_DRIFT = 7;
/** Extra outward nudge on top of edge bias in the jackpot zone. */
export const PLINKO_JACKPOT_EXTRA = 0.18;
/** Per-unit depth scaling once inside the jackpot zone. */
export const PLINKO_JACKPOT_DEPTH = 0.1;

export const PLINKO_BET = 50;

export const PLINKO_MAX_CONCURRENT = 1;
export const PLINKO_SPAWN_COOLDOWN_MS = 480;

/** Screen gravity (px/s²) — higher = faster fall. */
export const PLINKO_GRAVITY = 1950;
/** Extra ms after each peg hit for the rebound settle. */
export const PLINKO_BOUNCE_SETTLE_MS = 48;
export const PLINKO_MIN_SEGMENT_MS = 68;
export const PLINKO_MAX_SEGMENT_MS = 280;

/** @deprecated Duration derived from gravity; kept for reference only. */
export const PLINKO_BOUNCE_MS = 95;
/** @deprecated Duration derived from gravity; kept for reference only. */
export const PLINKO_DROP_MS = 280;
/** Brief flash on winning slot before overlay closes. */
export const PLINKO_SLOT_FLASH_MS = 220;
/** Hold panel open after reward + score float appear, before exit animation. */
export const PLINKO_REWARD_HOLD_MS = 1200;
export const PLINKO_EXIT_MS = 300;

export const PLINKO_BOARD_W = 620;
export const PLINKO_PEG_GAP_X = 32;
export const PLINKO_PEG_GAP_Y = 36;
export const PLINKO_BALL_SIZE = 22;
export const PLINKO_PEG_SIZE = 11;
export const PLINKO_TOP_PEGS = 3;
/** Header band — horizontal divider sits on its bottom edge. */
export const PLINKO_HEADER_H = 108;
/** Visible gap between divider line and first peg row. */
export const PLINKO_LINE_TO_PEG_GAP = 40;
/** Y of the first peg row (header + gap). */
export const PLINKO_TOP_PADDING = PLINKO_HEADER_H + PLINKO_LINE_TO_PEG_GAP;
export const PLINKO_DROP_Y = 54;
/** Aim zone height and offset above drop point. */
export const PLINKO_AIM_ZONE_H = 72;
export const PLINKO_AIM_ZONE_OFFSET_Y = 34;
/** Gap from last peg row to multiplier boxes. */
export const PLINKO_PEG_TO_SLOTS_GAP = 40;
/** Margin from board bottom to multiplier row. */
export const PLINKO_SLOTS_BOTTOM = 10;
export const PLINKO_SLOT_H = 40;
/** Gap above slot boxes where the ball settles. */
export const PLINKO_SLOTS_LAND_GAP = 6;

const PLINKO_LAST_PEG_Y = PLINKO_TOP_PADDING + (PLINKO_ROWS - 1) * PLINKO_PEG_GAP_Y;
export const PLINKO_SLOTS_TOP_Y =
  PLINKO_LAST_PEG_Y + PLINKO_PEG_SIZE / 2 + PLINKO_PEG_TO_SLOTS_GAP;
export const PLINKO_BOARD_H = Math.round(
  PLINKO_SLOTS_TOP_Y + PLINKO_SLOT_H + PLINKO_SLOTS_BOTTOM,
);
export const PLINKO_SLOTS_LAND_Y = PLINKO_SLOTS_TOP_Y - PLINKO_SLOTS_LAND_GAP;
/** Odds panel title block height. */
export const PLINKO_STATS_TITLE_H = 44;
/** Space between Odds title and probability rows. */
export const PLINKO_STATS_TITLE_GAP = 10;
export const PLINKO_STATS_ROW_GAP = 2;
const PLINKO_STATS_ROWS_BUDGET =
  PLINKO_BOARD_H -
  PLINKO_STATS_TITLE_H -
  PLINKO_STATS_TITLE_GAP -
  PLINKO_SLOTS_BOTTOM;
export const PLINKO_STATS_ROW_H = Math.min(
  PLINKO_SLOT_H,
  Math.floor(
    (PLINKO_STATS_ROWS_BUDGET - (PLINKO_SLOT_COUNT - 1) * PLINKO_STATS_ROW_GAP) /
      PLINKO_SLOT_COUNT,
  ),
);
/** Width of the probability panel beside the board. */
export const PLINKO_STATS_W = 124;
export const PLINKO_PLAY_W = PLINKO_BOARD_W + PLINKO_STATS_W + 12;

export function plinkoReward(multiplier: number): number {
  return Math.round(PLINKO_BET * multiplier);
}

export function formatPlinkoMultiplier(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(1).replace(/\.0$/, '');
}
