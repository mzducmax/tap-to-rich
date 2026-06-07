/**
 * Explosion effect at the counter when the bomb detonates.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

const EXPLOSION_SPARKS = Array.from({ length: 16 }, (_, i) => {
  const angle = (i / 16) * 360;
  const rad = (angle * Math.PI) / 180;
  const distance = 50 + (i % 5) * 14;
  return {
    id: i,
    x: Math.cos(rad) * distance,
    y: Math.sin(rad) * distance,
    size: 5 + (i % 4) * 3,
    color: ['#f97316', '#ef4444', '#fbbf24', '#44403c'][i % 4],
    delay: (i % 3) * 0.03,
  };
});

const EXPLOSION_DEBRIS = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  x: (i % 2 === 0 ? -1 : 1) * (30 + i * 12),
  y: -20 - i * 8,
  rotate: i * 45 - 90,
  delay: i * 0.04,
}));

export function CounterExplosion({ burstId }: { burstId: number }) {
  return (
    <AnimatePresence>
      {burstId > 0 && (
        <motion.div
          key={burstId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 overflow-visible"
        >
          <motion.div
            initial={{ scale: 0.1, opacity: 0.9 }}
            animate={{ scale: 3.2, opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="absolute w-28 h-28 rounded-full border-[5px] border-orange-500 bg-orange-400/25"
          />

          <motion.div
            initial={{ scale: 0.1, opacity: 0.7 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.05 }}
            className="absolute w-20 h-20 rounded-full border-2 border-yellow-300/80"
          />

          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: [0, 1.8, 1.2], opacity: [1, 0.85, 0] }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-yellow-100 via-orange-400 to-red-600 blur-[2px]"
          />

          {EXPLOSION_SPARKS.map((spark) => (
            <motion.div
              key={spark.id}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: spark.x,
                y: spark.y,
                opacity: 0,
                scale: 0.2,
              }}
              transition={{ duration: 0.55, ease: 'easeOut', delay: spark.delay }}
              className="absolute rounded-full"
              style={{
                width: spark.size,
                height: spark.size,
                backgroundColor: spark.color,
                boxShadow: `0 0 6px ${spark.color}`,
              }}
            />
          ))}

          {EXPLOSION_DEBRIS.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
              animate={{
                x: piece.x,
                y: piece.y,
                opacity: 0,
                rotate: piece.rotate,
              }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: piece.delay }}
              className="absolute w-3 h-3 bg-stone-700 rounded-sm"
            />
          ))}

          {[0, 1, 2].map((i) => (
            <motion.div
              key={`smoke-${i}`}
              initial={{ scale: 0.3, opacity: 0.7, x: (i - 1) * 18, y: 0 }}
              animate={{
                scale: [0.3, 1.6 + i * 0.3],
                opacity: [0.7, 0],
                y: [-10, -55 - i * 15],
                x: (i - 1) * 28,
              }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 + i * 0.08 }}
              className="absolute w-14 h-14 rounded-full bg-stone-500/50 blur-md"
            />
          ))}

          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -20 }}
            animate={{ scale: [0, 1.4, 1], opacity: [0, 1, 0], rotate: 15 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute text-6xl select-none"
          >
            💥
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
