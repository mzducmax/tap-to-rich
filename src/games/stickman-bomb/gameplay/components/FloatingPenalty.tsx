/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';

export function FloatingPenalty({
  amount,
  onComplete,
}: {
  amount: number;
  onComplete: () => void;
}) {
  return (
    <motion.span
      initial={{ y: 10, opacity: 0, scale: 0.5 }}
      animate={{
        y: [10, -20, -110],
        opacity: [0, 1, 0],
        scale: [0.5, 1.15, 0.9],
      }}
      transition={{ duration: 1.1, ease: 'easeOut', times: [0, 0.15, 1] }}
      onAnimationComplete={onComplete}
      className="absolute left-1/2 top-[42%] -translate-x-1/2 font-black text-red-500 select-none z-40 pointer-events-none"
      style={{
        fontSize: '3.25rem',
        fontFamily: '"Courier New", Courier, monospace',
        textShadow: '0 0 16px rgba(239,68,68,0.55)',
        WebkitTextStroke: '2px #991b1b',
      }}
    >
      −{amount}
    </motion.span>
  );
}
