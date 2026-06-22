/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { MOLE_REWARD } from '../config/moleConfig';
import { MOLE_SCORE_FLOAT_THEME } from '../config/moleScoreFloatTheme';

export function FloatingMoleBonus({ onComplete }: { onComplete: () => void }) {
  return (
    <motion.span
      initial={{ y: 8, opacity: 0, scale: 0.45, rotate: -4 }}
      animate={{
        y: [8, -28, -120],
        opacity: [0, 1, 0],
        scale: [0.45, 1.15, 0.95],
        rotate: [-4, 4, 0],
      }}
      transition={{ duration: 1.05, ease: 'easeOut', times: [0, 0.18, 1] }}
      onAnimationComplete={onComplete}
      className="absolute left-1/2 top-[28%] -translate-x-1/2 font-black select-none z-40 pointer-events-none whitespace-nowrap"
      style={{
        fontSize: '2.35rem',
        fontFamily: MOLE_SCORE_FLOAT_THEME.fontFamily,
        color: MOLE_SCORE_FLOAT_THEME.color,
        textShadow: MOLE_SCORE_FLOAT_THEME.shadow,
        WebkitTextStroke: `2px ${MOLE_SCORE_FLOAT_THEME.stroke}`,
        paintOrder: 'stroke fill',
      }}
    >
      {MOLE_SCORE_FLOAT_THEME.emoji} +${MOLE_REWARD}
    </motion.span>
  );
}
