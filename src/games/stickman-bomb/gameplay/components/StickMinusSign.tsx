/**
 * Minus sign for stick-line counter (matches StickDigit stroke style).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { STICK_DIGIT_VIEWBOX, STICK_MINUS_PATH } from '../logic/stickDigitPaths';

export function StickMinusSign() {
  return (
    <div className="digit-slot digit-sign-stick" aria-hidden>
      <svg className="stick-digit-glyph" viewBox={STICK_DIGIT_VIEWBOX}>
        <path d={STICK_MINUS_PATH} />
      </svg>
    </div>
  );
}
