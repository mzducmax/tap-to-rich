/**
 * One scrolling digit column (0–9) using stick-line glyphs.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { STICK_DIGIT_HEIGHT } from '../logic/stickDigitPaths';
import { StickDigitGlyph } from './StickDigitGlyph';

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export function StickDigit({ value }: { value: string }) {
  const digit = parseInt(value, 10) || 0;

  return (
    <div className="digit-slot">
      <div
        className="digit-strip"
        style={{ transform: `translate3d(0, -${digit * STICK_DIGIT_HEIGHT}px, 0)` }}
      >
        {DIGITS.map((d) => (
          <div key={d} className="digit-cell">
            <StickDigitGlyph digit={d} />
          </div>
        ))}
      </div>
    </div>
  );
}
