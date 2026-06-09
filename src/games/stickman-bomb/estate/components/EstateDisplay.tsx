/**
 * Centered estate — primary gameplay target.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import type { ReactNode, RefObject } from 'react';
import type { AnimationControls } from 'motion/react';
import { EstateIcon } from './EstateIcon';
import { estateSceneStyles } from '../styles/estateStyles';

import { ESTATE_ISLAND_URL, type EstateLevel } from '../config/estateConfig';
import type { EstateImageOverrides } from '../config/estateImageSettings';

type EstateDisplayProps = {
  score: number;
  targetScore: number;
  previewEstateLevel?: EstateLevel | null;
  estateImageOverrides?: EstateImageOverrides;
  freezeSway?: boolean;
  targetRef: RefObject<HTMLDivElement | null>;
  hitControls: AnimationControls;
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
  return (
    <div className="estate-scene" aria-hidden={false}>
      <style>{estateSceneStyles}</style>
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
          freezeSway={freezeSway}
          targetRef={targetRef}
          hitControls={hitControls}
          explosionOverlay={explosionOverlay}
        />
      </div>
    </div>
  );
}
