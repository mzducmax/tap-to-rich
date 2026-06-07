/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { SHEEP_REWARD } from '../config/sheepConfig';

export function FloatingSheepBonus({ onComplete }: { onComplete: () => void }) {
  return (
    <motion.span
      initial={{ y: 8, opacity: 0, scale: 0.45 }}
      animate={{
        y: [8, -28, -120],
        opacity: [0, 1, 0],
        scale: [0.45, 1.2, 1],
      }}
      transition={{ duration: 1.15, ease: 'easeOut', times: [0, 0.18, 1] }}
      onAnimationComplete={onComplete}
      className="absolute left-1/2 top-[28%] -translate-x-1/2 font-black text-lime-300 select-none z-40 pointer-events-none whitespace-nowrap"
      style={{
        fontSize: '2.75rem',
        fontFamily: '"Courier New", Courier, monospace',
        textShadow: '0 0 18px rgba(190,242,100,0.65)',
        WebkitTextStroke: '2px #3f6212',
      }}
    >
      +{SHEEP_REWARD} 🐑
    </motion.span>
  );
}
