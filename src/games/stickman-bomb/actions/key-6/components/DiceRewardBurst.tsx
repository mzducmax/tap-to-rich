/**
 * Coin burst when a dice roll pays out (key 6).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';
import { motion } from 'motion/react';

const SPARKS = Array.from({ length: 16 }, (_, i) => {
  const angle = (i / 16) * 360 + (i % 3) * 8;
  const rad = (angle * Math.PI) / 180;
  const distance = 48 + (i % 5) * 16;
  return {
    id: i,
    x: Math.cos(rad) * distance,
    y: Math.sin(rad) * distance,
    size: 16 + (i % 4) * 5,
    delay: (i % 4) * 0.04,
  };
});

type DiceRewardBurstProps = {
  x: number;
  y: number;
  reward: number;
  multiplier: number;
  face: number;
};

function DiceRewardBurstInner({ x, y, reward, multiplier, face }: DiceRewardBurstProps) {
  return (
    <div
      className="dice-reward-burst"
      style={{ left: x, top: y }}
      aria-hidden
    >
      <motion.div
        initial={{ scale: 0.15, opacity: 0.9 }}
        animate={{ scale: 3.2, opacity: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="dice-reward-burst-ring"
      />
      <motion.div
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: [0, 1.8, 1.2], opacity: [1, 0.85, 0] }}
        transition={{ duration: 0.48, ease: 'easeOut' }}
        className="dice-reward-burst-flash"
      />

      {SPARKS.map((spark) => (
        <motion.span
          key={spark.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: spark.x, y: spark.y, opacity: 0, scale: 0.25 }}
          transition={{ duration: 0.62, ease: 'easeOut', delay: spark.delay }}
          className="dice-reward-burst-spark"
          style={{ fontSize: spark.size }}
        >
          🪙
        </motion.span>
      ))}

      <motion.div
        initial={{ scale: 0.3, opacity: 0, y: 6 }}
        animate={{
          scale: [0.3, 1.2, 1.12, 1.02],
          opacity: [0, 1, 1, 0],
          y: [6, 6, 6, -58],
        }}
        transition={{
          duration: 1.35,
          ease: [0.22, 1, 0.36, 1],
          times: [0, 0.16, 0.38, 1],
        }}
        className="dice-reward-burst-amount"
      >
        +${reward.toLocaleString('en-US')}
        <span className="dice-reward-burst-meta">
          {face} × {multiplier}
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.8 }}
        animate={{
          opacity: [0, 1, 1, 0],
          y: [18, -34, -88, -132],
          scale: [0.8, 1.15, 1.1, 1],
        }}
        transition={{
          duration: 1.6,
          ease: [0.22, 1, 0.36, 1],
          times: [0, 0.22, 0.6, 1],
          delay: 0.12,
        }}
        className="dice-reward-burst-result"
      >
        {face} × {multiplier} = {reward.toLocaleString('en-US')}
      </motion.div>
    </div>
  );
}

export const DiceRewardBurst = memo(DiceRewardBurstInner);
