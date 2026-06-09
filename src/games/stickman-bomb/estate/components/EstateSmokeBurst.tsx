/**
 * Compact smoke burst when the estate tier changes.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { estateSmokeStyles } from '../styles/estateSmokeStyles';

const SMOKE_PUFFS = [
  { dx: -38, dy: -28, scale: 1.1, delay: 0 },
  { dx: 34, dy: -42, scale: 1.05, delay: 0.04 },
  { dx: -6, dy: -58, scale: 1.25, delay: 0.07 },
  { dx: 48, dy: -18, scale: 0.95, delay: 0.02 },
  { dx: 0, dy: -68, scale: 1.15, delay: 0.05 },
  { dx: -52, dy: -14, scale: 0.9, delay: 0.08 },
] as const;

type EstateSmokeBurstProps = {
  burstId: number;
  visible: boolean;
};

export function EstateSmokeBurst({ burstId, visible }: EstateSmokeBurstProps) {
  if (burstId <= 0) return null;

  return (
    <>
      <style>{estateSmokeStyles}</style>
      <motion.div
        key={burstId}
        className="estate-smoke-root"
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: [0.4, 1.45, 2.1], opacity: [0, 0.72, 0] }}
          transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
          className="estate-smoke-core"
        />

        {SMOKE_PUFFS.map((puff, index) => (
          <motion.div
            key={index}
            className="estate-smoke-puff"
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.35 }}
            animate={{
              x: puff.dx,
              y: puff.dy,
              opacity: [0, 0.82, 0],
              scale: [0.35, puff.scale, puff.scale * 1.35],
            }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
              delay: puff.delay,
            }}
          />
        ))}
      </motion.div>
    </>
  );
}
