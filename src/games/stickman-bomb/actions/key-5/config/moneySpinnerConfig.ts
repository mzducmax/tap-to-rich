/**
 * Money spinner — prize wheel with money tiers; the landed tier is
 * credited to the estate when the spin settles (key 5).
 * @license SPDX-License-Identifier: Apache-2.0
 */

export type SpinnerSegment = {
  /** Coins credited to the estate when the wheel lands here; negative = penalty. */
  amount: number;
  /** Wedge fill color. */
  color: string;
  /** Label text color on the wedge. */
  textColor: string;
  /** Relative pick weight — higher = lands here more often. */
  weight: number;
};

/** Wedges clockwise from the top pointer at rotation 0. */
export const SPINNER_SEGMENTS: SpinnerSegment[] = [
  { amount: 10, color: '#2e6df6', textColor: '#ffffff', weight: 24 },
  { amount: 100, color: '#f5a623', textColor: '#3a2400', weight: 10 },
  { amount: -20, color: '#3a3a42', textColor: '#ffffff', weight: 18 },
  { amount: 250, color: '#e0409a', textColor: '#ffffff', weight: 6 },
  { amount: 50, color: '#7a5cf0', textColor: '#ffffff', weight: 16 },
  { amount: 500, color: '#ef4444', textColor: '#ffffff', weight: 3 },
  { amount: -50, color: '#232328', textColor: '#ffffff', weight: 14 },
  { amount: 1000, color: '#ffd700', textColor: '#3a2400', weight: 1 },
];

export const SPINNER_SEGMENT_ANGLE = 360 / SPINNER_SEGMENTS.length;

/** Weighted pick of the winning wedge index. */
export function pickSpinnerSegmentIndex(): number {
  const total = SPINNER_SEGMENTS.reduce((sum, seg) => sum + seg.weight, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < SPINNER_SEGMENTS.length; i += 1) {
    roll -= SPINNER_SEGMENTS[i].weight;
    if (roll <= 0) return i;
  }
  return SPINNER_SEGMENTS.length - 1;
}

/** Above estate counter layer (25) and TargetGoalDock (App z-10). */
export const MONEY_SPINNER_OVERLAY_Z = 40;

export const MONEY_SPINNER_WHEEL_SIZE = 340;

/** Full clockwise turns before easing onto the winning wedge. */
export const MONEY_SPINNER_MIN_TURNS = 3;
export const MONEY_SPINNER_EXTRA_TURNS = 1;

/** Wheel ramp-up + ease-out to rest (ms). */
export const MONEY_SPINNER_SPIN_MS = 2000;
/** Winning wedge stays highlighted this long before fading (ms). */
export const MONEY_SPINNER_RESULT_HOLD_MS = 1000;
export const MONEY_SPINNER_FADE_MS = 350;
/** Pop-in intro before the spin starts (ms). */
export const MONEY_SPINNER_INTRO_MS = 260;

export const MONEY_SPINNER_MAX_CONCURRENT = 1;
export const MONEY_SPINNER_SPAWN_COOLDOWN_MS = 500;
