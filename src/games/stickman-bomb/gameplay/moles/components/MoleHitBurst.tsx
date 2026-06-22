/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { MOLE_REWARD } from '../config/moleConfig';
import { MOLE_SCORE_FLOAT_THEME } from '../config/moleScoreFloatTheme';
import { moleHitBurstStyles } from '../styles/moleHitBurstStyles';

const PARTICLES = [
  { dx: -40, dy: -32, rotate: -12, emoji: '🐭', delay: 0 },
  { dx: 38, dy: -36, rotate: 10, emoji: '💥', delay: 0.02 },
  { dx: -18, dy: -52, rotate: -4, emoji: '✨', delay: 0.04 },
  { dx: 24, dy: -22, rotate: 8, emoji: '🐭', delay: 0.01 },
  { dx: 0, dy: -60, rotate: 0, emoji: '⭐', delay: 0 },
] as const;

export function MoleHitBurst({
  x,
  y,
  onComplete,
}: {
  x: number;
  y: number;
  onComplete: () => void;
}) {
  return (
    <>
      <style>{moleHitBurstStyles}</style>
      <div className="mole-hit-burst-root" style={{ left: x, top: y }} aria-hidden>
        <motion.div
          initial={{ scale: 0.35, opacity: 0 }}
          animate={{ scale: [0.35, 1.35, 1.8], opacity: [0, 0.85, 0] }}
          transition={{ duration: 0.38, ease: 'easeOut' }}
          className="mole-hit-burst-ring"
        />
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: [0.5, 1.1, 0.9], opacity: [0, 1, 0] }}
          transition={{ duration: 0.32, ease: 'easeOut' }}
          className="mole-hit-burst-flash"
        />
        {PARTICLES.map((particle, index) => (
          <motion.span
            key={index}
            className="mole-hit-burst-particle"
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.4, rotate: 0 }}
            animate={{
              x: particle.dx,
              y: particle.dy,
              opacity: [0, 1, 0],
              scale: [0.4, 1.15, 0.75],
              rotate: particle.rotate,
            }}
            transition={{
              duration: 0.55,
              ease: 'easeOut',
              delay: particle.delay,
            }}
          >
            {particle.emoji}
          </motion.span>
        ))}
        <motion.span
          initial={{ y: 6, opacity: 0, scale: 0.6 }}
          animate={{ y: [-8, -42], opacity: [0, 1, 0], scale: [0.6, 1.05, 0.85] }}
          transition={{ duration: 0.65, ease: 'easeOut', times: [0, 0.25, 1] }}
          onAnimationComplete={onComplete}
          className="mole-hit-burst-label"
        >
          {MOLE_SCORE_FLOAT_THEME.emoji} +${MOLE_REWARD}
        </motion.span>
      </div>
    </>
  );
}
