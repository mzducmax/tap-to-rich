/**
 * Explosion effect at the counter when the bomb detonates (−$10).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

const EXPLOSION_SPARKS = Array.from({ length: 20 }, (_, i) => {
  const angle = (i / 20) * 360;
  const rad = (angle * Math.PI) / 180;
  const distance = 72 + (i % 5) * 18;
  return {
    id: i,
    x: Math.cos(rad) * distance,
    y: Math.sin(rad) * distance,
    size: 7 + (i % 4) * 4,
    color: ['#f97316', '#ef4444', '#fbbf24', '#44403c'][i % 4],
    delay: (i % 3) * 0.03,
  };
});

const EXPLOSION_DEBRIS = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  x: (i % 2 === 0 ? -1 : 1) * (38 + i * 14),
  y: -26 - i * 10,
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
            initial={{ scale: 0.1, opacity: 0.95 }}
            animate={{ scale: 4.8, opacity: 0 }}
            transition={{ duration: 0.62, ease: 'easeOut' }}
            className="absolute w-40 h-40 rounded-full border-[6px] border-orange-500 bg-orange-400/30"
          />

          <motion.div
            initial={{ scale: 0.1, opacity: 0.8 }}
            animate={{ scale: 3.2, opacity: 0 }}
            transition={{ duration: 0.48, ease: 'easeOut', delay: 0.05 }}
            className="absolute w-28 h-28 rounded-full border-[3px] border-yellow-300/90"
          />

          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: [0, 2.4, 1.6], opacity: [1, 0.9, 0] }}
            transition={{ duration: 0.52, ease: 'easeOut' }}
            className="absolute w-36 h-36 rounded-full bg-gradient-to-br from-yellow-100 via-orange-400 to-red-600 blur-[3px]"
          />

          {EXPLOSION_SPARKS.map((spark) => (
            <motion.div
              key={spark.id}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: spark.x,
                y: spark.y,
                opacity: 0,
                scale: 0.15,
              }}
              transition={{ duration: 0.62, ease: 'easeOut', delay: spark.delay }}
              className="absolute rounded-full"
              style={{
                width: spark.size,
                height: spark.size,
                backgroundColor: spark.color,
                boxShadow: `0 0 10px ${spark.color}`,
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
              transition={{ duration: 0.68, ease: 'easeOut', delay: piece.delay }}
              className="absolute w-4 h-4 bg-stone-700 rounded-sm"
            />
          ))}

          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={`smoke-${i}`}
              initial={{ scale: 0.3, opacity: 0.75, x: (i - 1.5) * 22, y: 0 }}
              animate={{
                scale: [0.3, 2.1 + i * 0.35],
                opacity: [0.75, 0],
                y: [-12, -68 - i * 18],
                x: (i - 1.5) * 34,
              }}
              transition={{ duration: 0.82, ease: 'easeOut', delay: 0.1 + i * 0.07 }}
              className="absolute w-20 h-20 rounded-full bg-stone-500/55 blur-lg"
            />
          ))}

          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -20 }}
            animate={{ scale: [0, 1.85, 1.35], opacity: [0, 1, 0], rotate: 15 }}
            transition={{ duration: 0.58, ease: 'easeOut' }}
            className="absolute text-8xl select-none"
          >
            💥
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
