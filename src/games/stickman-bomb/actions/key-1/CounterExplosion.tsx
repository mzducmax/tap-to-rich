/**
 * Gold coin burst when the gift box opens on the counter (+$10).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

const COIN_SPARKS = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * 360;
  const rad = (angle * Math.PI) / 180;
  const distance = 42 + (i % 5) * 12;
  return {
    id: i,
    x: Math.cos(rad) * distance,
    y: Math.sin(rad) * distance,
    size: 14 + (i % 3) * 4,
    delay: (i % 3) * 0.03,
  };
});

const COIN_DEBRIS = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  x: (i % 2 === 0 ? -1 : 1) * (24 + i * 10),
  y: -28 - i * 10,
  rotate: i * 40 - 60,
  delay: i * 0.05,
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
            initial={{ scale: 0.1, opacity: 0.85 }}
            animate={{ scale: 2.8, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute w-24 h-24 rounded-full border-[4px] border-yellow-400 bg-yellow-300/20"
          />

          <motion.div
            initial={{ scale: 0.1, opacity: 0.7 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 0.42, ease: 'easeOut', delay: 0.04 }}
            className="absolute w-16 h-16 rounded-full border-2 border-amber-200/80"
          />

          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: [0, 1.6, 1.1], opacity: [1, 0.9, 0] }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-yellow-100 via-amber-300 to-yellow-500 blur-[2px]"
          />

          {COIN_SPARKS.map((spark) => (
            <motion.div
              key={spark.id}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: spark.x,
                y: spark.y,
                opacity: 0,
                scale: 0.3,
              }}
              transition={{ duration: 0.55, ease: 'easeOut', delay: spark.delay }}
              className="absolute select-none"
              style={{ fontSize: spark.size }}
            >
              🪙
            </motion.div>
          ))}

          {COIN_DEBRIS.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
              animate={{
                x: piece.x,
                y: piece.y,
                opacity: 0,
                rotate: piece.rotate,
              }}
              transition={{ duration: 0.62, ease: 'easeOut', delay: piece.delay }}
              className="absolute text-xl select-none"
            >
              💰
            </motion.div>
          ))}

          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -12 }}
            animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 0], rotate: 8 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute text-5xl select-none"
          >
            +$10
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
