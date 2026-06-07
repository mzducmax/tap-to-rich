/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { StickSheepIcon } from './StickSheepIcon';
import { sheepWarningBannerStyles } from '../styles/sheepWarningBannerStyles';

export function SheepWarningBanner() {
  return (
    <motion.div
      className="sheep-warning-banner"
      animate={{ opacity: [1, 0.55, 1], y: [0, -3, 0] }}
      transition={{ duration: 0.55, repeat: Infinity, ease: 'easeInOut' }}
      role="status"
      aria-live="polite"
    >
      <style>{sheepWarningBannerStyles}</style>
      <div className="sheep-warning-banner-box">
        <span className="sheep-warning-joint sheep-warning-joint-tl" aria-hidden />
        <span className="sheep-warning-joint sheep-warning-joint-tr" aria-hidden />
        <span className="sheep-warning-joint sheep-warning-joint-bl" aria-hidden />
        <span className="sheep-warning-joint sheep-warning-joint-br" aria-hidden />

        <div className="sheep-warning-icon-wrap" aria-hidden>
          <StickSheepIcon />
          <span className="sheep-warning-icon-badge">!</span>
        </div>

        <div className="sheep-warning-copy">
          <span className="sheep-warning-kicker">Heads up</span>
          <p className="sheep-warning-title">Sheep incoming!</p>
        </div>
      </div>
    </motion.div>
  );
}
