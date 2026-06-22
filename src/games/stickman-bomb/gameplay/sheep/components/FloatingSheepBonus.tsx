/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import {
  getSheepHitDelta,
  type SheepVariant,
} from '../config/sheepConfig';
import {
  formatSheepHitLabel,
  SHEEP_SCORE_FLOAT_THEMES,
  SHEEP_SCORE_RISE_ANIMATION,
} from '../config/sheepScoreFloatTheme';

export function FloatingSheepBonus({
  variant = 'white',
  onComplete,
}: {
  variant?: Exclude<SheepVariant, 'black'>;
  onComplete: () => void;
}) {
  const delta = getSheepHitDelta(variant);
  const theme = SHEEP_SCORE_FLOAT_THEMES[variant];
  const rise = SHEEP_SCORE_RISE_ANIMATION.counter;

  return (
    <motion.span
      initial={rise.initial}
      animate={rise.animate}
      transition={rise.transition}
      onAnimationComplete={onComplete}
      className="absolute left-1/2 top-[28%] -translate-x-1/2 font-black select-none z-40 pointer-events-none whitespace-nowrap"
      style={{
        fontSize: theme.counterFontSize,
        fontFamily: '"Arial Rounded MT Bold", "Nunito", "Trebuchet MS", sans-serif',
        fontWeight: 900,
        letterSpacing: '0.02em',
        color: theme.color,
        WebkitTextStroke: `1.75px ${theme.stroke}`,
        textShadow: theme.shadow,
        paintOrder: 'stroke fill',
        padding: '0.16rem 0.72rem',
        borderRadius: '999px',
        background: theme.bg,
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.32)',
      }}
    >
      {formatSheepHitLabel(delta)}
    </motion.span>
  );
}
