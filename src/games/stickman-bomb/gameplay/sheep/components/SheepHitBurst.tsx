/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { sheepHitBurstStyles } from '../styles/sheepHitBurstStyles';

const PARTICLES = [
  { dx: -52, dy: -38, rotate: -24, emoji: '💨', delay: 0 },
  { dx: 48, dy: -44, rotate: 18, emoji: '✨', delay: 0.02 },
  { dx: -28, dy: -62, rotate: -8, emoji: '🐑', delay: 0.04 },
  { dx: 34, dy: -28, rotate: 12, emoji: '⭐', delay: 0.01 },
  { dx: 0, dy: -74, rotate: 0, emoji: '💥', delay: 0 },
] as const;

export function SheepHitBurst({
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
      <style>{sheepHitBurstStyles}</style>
      <div
        className="sheep-hit-burst-root"
        style={{ left: x, top: y }}
        aria-hidden
      >
      <motion.div
        initial={{ scale: 0.35, opacity: 0 }}
        animate={{ scale: [0.35, 1.35, 1.8], opacity: [0, 0.85, 0] }}
        transition={{ duration: 0.38, ease: 'easeOut' }}
        className="sheep-hit-burst-ring"
      />
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: [0.5, 1.1, 0.9], opacity: [0, 1, 0] }}
        transition={{ duration: 0.32, ease: 'easeOut' }}
        className="sheep-hit-burst-flash"
      />
      {PARTICLES.map((particle, index) => (
        <motion.span
          key={index}
          className="sheep-hit-burst-particle"
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
        className="sheep-hit-burst-label"
      >
        +5
      </motion.span>
      </div>
    </>
  );
}
