/**
 * A single digit rendered as stick-line SVG.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { STICK_DIGIT_PATHS, STICK_DIGIT_VIEWBOX } from '../logic/stickDigitPaths';

export function StickDigitGlyph({ digit }: { digit: number }) {
  const value = Math.min(9, Math.max(0, digit));
  const path = STICK_DIGIT_PATHS[value];

  return (
    <svg
      className="stick-digit-glyph"
      viewBox={STICK_DIGIT_VIEWBOX}
      aria-hidden
    >
      <path d={path} />
    </svg>
  );
}
