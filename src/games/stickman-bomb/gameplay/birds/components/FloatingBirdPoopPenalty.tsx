/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { BIRD_POOP_PENALTY } from '../config/birdConfig';

export function FloatingBirdPoopPenalty({
  onComplete,
}: {
  onComplete: () => void;
}) {
  return (
    <motion.span
      initial={{ y: 0, opacity: 0, scale: 0.5 }}
      animate={{
        y: [0, -18, -72],
        opacity: [0, 1, 0],
        scale: [0.5, 1.12, 0.92],
      }}
      transition={{ duration: 1.05, ease: 'easeOut', times: [0, 0.2, 1] }}
      onAnimationComplete={onComplete}
      className="bird-poop-penalty-float"
      aria-hidden
    >
      -{BIRD_POOP_PENALTY}$
    </motion.span>
  );
}
