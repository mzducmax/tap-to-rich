/**
 * Estate icon — gameplay target (hammer, bomb, bow, bird poop).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { motion, type AnimationControls } from 'motion/react';
import { formatLevelLabel } from '../../background/config/levelConfig';
import {
  estateNeedsSeatUp,
  getEstateImageUrl,
  scoreToEstateLevel,
  type EstateLevel,
} from '../config/estateConfig';
import type { EstateImageOverrides } from '../config/estateImageSettings';
import { estateIconStyles } from '../styles/estateStyles';
import { EstateSmokeBurst } from './EstateSmokeBurst';

const REVEAL_MS = 360;
const SMOKE_DURATION_MS = 520;

const EASE_SMOOTH = [0.22, 1, 0.36, 1] as const;

type EstateIconProps = {
  score: number;
  targetScore: number;
  levelOverride?: EstateLevel;
  estateImageOverrides?: EstateImageOverrides;
  targetRef: RefObject<HTMLDivElement | null>;
  hitControls: AnimationControls;
  explosionOverlay?: ReactNode;
};

export function EstateIcon({
  score,
  targetScore,
  levelOverride,
  estateImageOverrides,
  targetRef,
  hitControls,
  explosionOverlay,
}: EstateIconProps) {
  const activeLevel = useMemo(
    () => levelOverride ?? scoreToEstateLevel(score, targetScore),
    [levelOverride, score, targetScore],
  );

  const displayLevelRef = useRef(activeLevel);
  const isFirstMount = useRef(true);
  const [displayLevel, setDisplayLevel] = useState(activeLevel);
  const [buildingOpacity, setBuildingOpacity] = useState(1);
  const [smokeBurstId, setSmokeBurstId] = useState(0);
  const [smokeVisible, setSmokeVisible] = useState(false);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      displayLevelRef.current = activeLevel;
      setDisplayLevel(activeLevel);
      return;
    }

    if (activeLevel === displayLevelRef.current) return;

    let cancelled = false;
    let revealFrame = 0;

    displayLevelRef.current = activeLevel;
    setDisplayLevel(activeLevel);
    setBuildingOpacity(0.2);
    setSmokeVisible(true);
    setSmokeBurstId((id) => id + 1);

    revealFrame = requestAnimationFrame(() => {
      if (!cancelled) setBuildingOpacity(1);
    });

    const smokeOffTimer = window.setTimeout(() => {
      if (!cancelled) setSmokeVisible(false);
    }, SMOKE_DURATION_MS);

    return () => {
      cancelled = true;
      cancelAnimationFrame(revealFrame);
      clearTimeout(smokeOffTimer);
    };
  }, [activeLevel]);

  return (
    <>
      <style>{estateIconStyles}</style>
      <motion.div
        ref={targetRef}
        id="estate-target"
        className={`estate-icon${estateNeedsSeatUp(displayLevel) ? ' estate-icon--seat-up' : ''}`}
        animate={hitControls}
        title={`Estate ${formatLevelLabel(displayLevel)}`}
      >
        {explosionOverlay}
        <EstateSmokeBurst burstId={smokeBurstId} visible={smokeVisible} />
        <motion.img
          key={displayLevel}
          src={getEstateImageUrl(displayLevel, estateImageOverrides)}
          alt=""
          className="estate-building-image"
          initial={{ opacity: 0.2, scale: 0.96, y: 8, filter: 'blur(2px)' }}
          animate={{
            opacity: buildingOpacity,
            scale: 0.96 + buildingOpacity * 0.04,
            y: (1 - buildingOpacity) * 8,
            filter: `blur(${(1 - buildingOpacity) * 2}px)`,
          }}
          transition={{
            duration: REVEAL_MS / 1000,
            ease: EASE_SMOOTH,
          }}
        />
      </motion.div>
    </>
  );
}
