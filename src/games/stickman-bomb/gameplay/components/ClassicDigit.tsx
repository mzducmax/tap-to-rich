/**
 * One scrolling digit column (0–9) using classic doodle font.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
export const CLASSIC_DIGIT_HEIGHT = 100;
export const BALANCE_DIGIT_HEIGHT = 108;

export function ClassicDigit({
  value,
  cellHeight = CLASSIC_DIGIT_HEIGHT,
}: {
  value: string;
  cellHeight?: number;
}) {
  const digit = parseInt(value, 10) || 0;

  return (
    <div className="digit-slot">
      <div
        className="digit-strip"
        style={{ transform: `translateY(-${digit * cellHeight}px)` }}
      >
        {DIGITS.map((d) => (
          <div key={d} className="digit">
            {d}
          </div>
        ))}
      </div>
    </div>
  );
}
