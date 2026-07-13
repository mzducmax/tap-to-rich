/**
 * Centered estate — primary gameplay target.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, type ReactNode, type RefObject } from 'react';
import { motion, useAnimation } from 'motion/react';
import { EstateIcon } from './EstateIcon';
import { StaticStyle } from '../../../../components/StaticStyle';
import { estateSceneStyles } from '../styles/estateStyles';

import { ESTATE_ISLAND_URL, type EstateLevel } from '../config/estateConfig';
import { ESTATE_IDLE_SWAY } from '../config/estateIdleSway';
import type { EstateImageOverrides } from '../config/estateImageSettings';

type EstateDisplayProps = {
  score: number;
  targetScore: number;
  previewEstateLevel?: EstateLevel | null;
  estateImageOverrides?: EstateImageOverrides;
  freezeSway?: boolean;
  targetRef: RefObject<HTMLDivElement | null>;
  hitControls: ReturnType<typeof useAnimation>;
  explosionOverlay?: ReactNode;
};

export function EstateDisplay({
  score,
  targetScore,
  previewEstateLevel = null,
  estateImageOverrides,
  freezeSway = false,
  targetRef,
  hitControls,
  explosionOverlay,
}: EstateDisplayProps) {
  const swayControls = useAnimation();

  useEffect(() => {
    if (freezeSway) {
      void swayControls.stop();
      return;
    }

    void swayControls.start(ESTATE_IDLE_SWAY);
  }, [freezeSway, swayControls]);

  return (
    <div className="estate-scene" aria-hidden={false}>
      <StaticStyle css={estateSceneStyles} />
      <motion.div className="estate-sway" animate={swayControls}>
        <div className="estate-stack">
          <img
            src={ESTATE_ISLAND_URL}
            alt=""
            className="estate-island"
            aria-hidden
          />
          <EstateIcon
            score={score}
            targetScore={targetScore}
            levelOverride={previewEstateLevel ?? undefined}
            estateImageOverrides={estateImageOverrides}
            targetRef={targetRef}
            hitControls={hitControls}
            explosionOverlay={explosionOverlay}
          />
        </div>
      </motion.div>
    </div>
  );
}
