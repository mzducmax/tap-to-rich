/**
 * CSS 3D die — six pip faces (key 6).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';

type DiceCubeProps = {
  cubeRef?: React.RefObject<HTMLDivElement | null>;
};

function PipGrid() {
  return (
    <>
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className="dice-roll-pip" />
      ))}
    </>
  );
}

function DiceCubeInner({ cubeRef }: DiceCubeProps) {
  return (
    <div ref={cubeRef} className="dice-roll-cube" aria-hidden>
      <div className="dice-roll-face dice-roll-face-1">
        <PipGrid />
      </div>
      <div className="dice-roll-face dice-roll-face-6">
        <PipGrid />
      </div>
      <div className="dice-roll-face dice-roll-face-2">
        <PipGrid />
      </div>
      <div className="dice-roll-face dice-roll-face-5">
        <PipGrid />
      </div>
      <div className="dice-roll-face dice-roll-face-3">
        <PipGrid />
      </div>
      <div className="dice-roll-face dice-roll-face-4">
        <PipGrid />
      </div>
    </div>
  );
}

export const DiceCube = memo(DiceCubeInner);
