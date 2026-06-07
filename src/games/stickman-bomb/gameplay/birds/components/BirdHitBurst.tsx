/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { BIRD_SHOOT_REWARD } from '../config/birdConfig';
import { birdHitBurstStyles } from '../styles/birdHitBurstStyles';

const SMOKE_PUFFS = [
  { dx: -38, dy: -18, scale: 1.15, delay: 0 },
  { dx: 28, dy: -32, scale: 1.05, delay: 0.04 },
  { dx: -12, dy: -48, scale: 1.35, delay: 0.07 },
  { dx: 42, dy: -8, scale: 0.95, delay: 0.02 },
  { dx: 0, dy: -56, scale: 1.25, delay: 0.05 },
  { dx: -52, dy: -6, scale: 0.88, delay: 0.08 },
] as const;

export function BirdHitBurst({
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
      <style>{birdHitBurstStyles}</style>
      <div
        className="bird-hit-burst-root"
        style={{ left: x, top: y }}
        aria-hidden
      >
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: [0.4, 1.6, 2.4], opacity: [0, 0.75, 0] }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="bird-hit-burst-smoke-core"
        />
        {SMOKE_PUFFS.map((puff, index) => (
          <motion.div
            key={index}
            className="bird-hit-burst-smoke-puff"
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.35 }}
            animate={{
              x: puff.dx,
              y: puff.dy,
              opacity: [0, 0.85, 0],
              scale: [0.35, puff.scale, puff.scale * 1.6],
            }}
            transition={{
              duration: 0.62,
              ease: 'easeOut',
              delay: puff.delay,
            }}
          />
        ))}
        <motion.span
          initial={{ y: 6, opacity: 0, scale: 0.6 }}
          animate={{ y: [-8, -40], opacity: [0, 1, 0], scale: [0.6, 1.05, 0.85] }}
          transition={{ duration: 0.72, ease: 'easeOut', times: [0, 0.25, 1] }}
          onAnimationComplete={onComplete}
          className="bird-hit-burst-label"
        >
          +${BIRD_SHOOT_REWARD}
        </motion.span>
      </div>
    </>
  );
}
