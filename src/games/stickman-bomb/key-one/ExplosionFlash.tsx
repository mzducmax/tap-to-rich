/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';

export function ExplosionFlash({ burstId }: { burstId: number }) {
  if (burstId === 0) return null;

  return (
    <motion.div
      key={burstId}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.35, 0] }}
      transition={{ duration: 0.45 }}
      className="absolute inset-0 bg-orange-100 z-50 pointer-events-none"
    />
  );
}
