/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { stickmanStyles } from './stickmanStyles';

export type StickmanPose = 'idle' | 'run' | 'throw-windup' | 'throw-release' | 'drop' | 'toss-up';

export function CurvyStickman({
  pose,
  showHandBomb,
}: {
  pose: StickmanPose;
  showHandBomb: boolean;
}) {
  const poseClass =
    pose === 'idle'
      ? ''
      : pose === 'throw-windup'
        ? 'sb-pose-throw-windup'
        : pose === 'throw-release'
          ? 'sb-pose-throw-release'
          : pose === 'drop'
            ? 'sb-pose-drop'
            : pose === 'toss-up'
              ? 'sb-pose-toss-up'
              : `sb-pose-${pose}`;

  return (
    <div className={`sb-stickman-root ${poseClass}`}>
      <style>{stickmanStyles}</style>
      <div className="sb-humanoid">
        <div className="sb-head">
          <div className="sb-face">
            <span className="sb-eye sb-eye-l" />
            <span className="sb-eye sb-eye-r" />
            <span className="sb-mouth" />
          </div>
        </div>
        <div className="sb-torso">
          <div className="sb-limb sb-upper sb-arm-b">
            <div className="sb-limb sb-lower">
              <span className="sb-hand" />
            </div>
          </div>
          <div className="sb-limb sb-upper sb-arm-f">
            <div className="sb-limb sb-lower">
              <span className="sb-hand" />
              {showHandBomb && <span className="sb-hand-bomb">💣</span>}
            </div>
          </div>
          <div className="sb-limb sb-upper sb-leg-b">
            <div className="sb-limb sb-lower">
              <span className="sb-foot" />
            </div>
          </div>
          <div className="sb-limb sb-upper sb-leg-f">
            <div className="sb-limb sb-lower">
              <span className="sb-foot" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
