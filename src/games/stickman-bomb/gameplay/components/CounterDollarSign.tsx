/**
 * Dollar sign suffix shown after the score digits.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { STICK_DOLLAR_PATH, STICK_DIGIT_VIEWBOX } from '../logic/stickDigitPaths';
import type { CounterDisplayStyle } from '../config/counterDisplayStyle';

export function CounterDollarSign({ style }: { style: CounterDisplayStyle }) {
  if (style === 'balance') {
    return (
      <span className="counter-dollar counter-dollar-balance" aria-hidden>
        $
      </span>
    );
  }

  if (style === 'classic') {
    return (
      <span className="counter-dollar counter-dollar-classic" aria-hidden>
        $
      </span>
    );
  }

  return (
    <svg
      className="counter-dollar counter-dollar-stick"
      viewBox={STICK_DIGIT_VIEWBOX}
      aria-hidden
    >
      <path d={STICK_DOLLAR_PATH} />
    </svg>
  );
}
