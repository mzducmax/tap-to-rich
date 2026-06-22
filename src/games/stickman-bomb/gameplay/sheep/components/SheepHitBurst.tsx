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
  SHEEP_SCORE_RISE_ANIMATION,
} from '../config/sheepScoreFloatTheme';
import { sheepHitBurstStyles } from '../styles/sheepHitBurstStyles';

const BONUS_PARTICLES = [
  { dx: -52, dy: -38, rotate: -24, emoji: '💨', delay: 0 },
  { dx: 48, dy: -44, rotate: 18, emoji: '✨', delay: 0.02 },
  { dx: -28, dy: -62, rotate: -8, emoji: '🐑', delay: 0.04 },
  { dx: 34, dy: -28, rotate: 12, emoji: '⭐', delay: 0.01 },
  { dx: 0, dy: -74, rotate: 0, emoji: '💥', delay: 0 },
] as const;

const GOLD_PARTICLES = [
  { dx: -54, dy: -36, rotate: -20, emoji: '✨', delay: 0 },
  { dx: 50, dy: -46, rotate: 16, emoji: '💰', delay: 0.02 },
  { dx: -24, dy: -64, rotate: -6, emoji: '🐑', delay: 0.04 },
  { dx: 36, dy: -30, rotate: 12, emoji: '⭐', delay: 0.01 },
  { dx: 0, dy: -78, rotate: 0, emoji: '💥', delay: 0 },
] as const;

const PINK_PARTICLES = [
  { dx: -50, dy: -36, rotate: -18, emoji: '💖', delay: 0 },
  { dx: 46, dy: -42, rotate: 14, emoji: '✨', delay: 0.02 },
  { dx: -26, dy: -60, rotate: -6, emoji: '🐑', delay: 0.04 },
  { dx: 32, dy: -26, rotate: 10, emoji: '💗', delay: 0.01 },
  { dx: 0, dy: -72, rotate: 0, emoji: '💥', delay: 0 },
] as const;

const PENALTY_PARTICLES = [
  { dx: -48, dy: -34, rotate: -18, emoji: '💢', delay: 0 },
  { dx: 44, dy: -40, rotate: 16, emoji: '❌', delay: 0.02 },
  { dx: -22, dy: -58, rotate: -6, emoji: '🐑', delay: 0.04 },
  { dx: 30, dy: -24, rotate: 10, emoji: '💸', delay: 0.01 },
  { dx: 0, dy: -68, rotate: 0, emoji: '💥', delay: 0 },
] as const;

function burstRootClass(variant: SheepVariant): string {
  switch (variant) {
    case 'gold':
      return 'sheep-hit-burst-root sheep-hit-burst-root-gold';
    case 'pink':
      return 'sheep-hit-burst-root sheep-hit-burst-root-pink';
    case 'black':
      return 'sheep-hit-burst-root sheep-hit-burst-root-penalty';
    default:
      return 'sheep-hit-burst-root';
  }
}

export function SheepHitBurst({
  x,
  y,
  variant = 'white',
  onComplete,
}: {
  x: number;
  y: number;
  variant?: SheepVariant;
  onComplete: () => void;
}) {
  const particles =
    variant === 'black'
      ? PENALTY_PARTICLES
      : variant === 'gold'
        ? GOLD_PARTICLES
        : variant === 'pink'
          ? PINK_PARTICLES
          : BONUS_PARTICLES;
  const delta = getSheepHitDelta(variant);
  const rise = SHEEP_SCORE_RISE_ANIMATION.burst;

  return (
    <>
      <style>{sheepHitBurstStyles}</style>
      <div
        className={burstRootClass(variant)}
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
      {particles.map((particle, index) => (
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
        initial={rise.initial}
        animate={rise.animate}
        transition={rise.transition}
        onAnimationComplete={onComplete}
        className="sheep-hit-burst-label"
      >
        {formatSheepHitLabel(delta)}
      </motion.span>
      </div>
    </>
  );
}
