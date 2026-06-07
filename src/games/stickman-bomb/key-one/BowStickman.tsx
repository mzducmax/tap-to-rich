/**
 * Side-view archer stickman — one hand holds bow, one pulls string (ref. archery pose).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { bowStickmanStyles } from './bowStickmanStyles';

export type BowStickmanPose = 'stand' | 'aim' | 'release';

export function BowStickman({ pose }: { pose: BowStickmanPose }) {
  return (
    <div className={`sb-bow-archer-root sb-bow-pose-${pose}`}>
      <style>{bowStickmanStyles}</style>
      <svg
        className="sb-bow-archer-svg"
        viewBox="0 0 112 118"
        aria-hidden
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Legs — wide stable stance */}
        <line className="sb-bow-limb" x1="34" y1="68" x2="20" y2="104" />
        <line className="sb-bow-limb" x1="34" y1="68" x2="48" y2="104" />
        <ellipse className="sb-bow-foot" cx="20" cy="106" rx="7" ry="3.5" />
        <ellipse className="sb-bow-foot" cx="48" cy="106" rx="7" ry="3.5" />

        {/* Torso */}
        <line className="sb-bow-limb sb-bow-torso-line" x1="34" y1="32" x2="34" y2="68" />

        {/* Back arm — upper arm + draw variants */}
        <g className="sb-bow-back-arm">
          <line className="sb-bow-limb" x1="34" y1="40" x2="20" y2="34" />
          <g className="sb-bow-draw sb-bow-draw-stand">
            <line className="sb-bow-limb" x1="20" y1="34" x2="46" y2="44" />
            <circle className="sb-bow-hand-dot" cx="46" cy="44" r="4" />
          </g>
          <g className="sb-bow-draw sb-bow-draw-aim">
            <line className="sb-bow-limb sb-bow-back-forearm" x1="20" y1="34" x2="38" y2="44" />
            <circle className="sb-bow-hand-dot sb-bow-string-hand" cx="38" cy="44" r="4" />
          </g>
          <g className="sb-bow-draw sb-bow-draw-release">
            <line className="sb-bow-limb sb-bow-back-forearm-release" x1="20" y1="34" x2="52" y2="46" />
            <circle className="sb-bow-hand-dot" cx="52" cy="46" r="4" />
          </g>
        </g>

        {/* Front arm — horizontal, holds bow grip */}
        <g className="sb-bow-front-arm">
          <line className="sb-bow-limb" x1="34" y1="40" x2="52" y2="44" />
          <circle className="sb-bow-hand-dot" cx="52" cy="44" r="4" />
        </g>

        {/* Bow, string, arrow */}
        <g className="sb-bow-weapon">
          <path className="sb-bow-curve" d="M 58 14 Q 74 44 58 74" fill="none" />
          <path className="sb-bow-grip" d="M 54 40 L 54 48" />
          <polyline className="sb-bow-string sb-bow-string-stand" points="58,14 46,44 58,74" />
          <polyline className="sb-bow-string sb-bow-string-aim" points="58,14 38,44 58,74" />
          <polyline className="sb-bow-string sb-bow-string-rest" points="58,14 58,44 58,74" />
          <g className="sb-bow-arrow-on-bow sb-bow-arrow-stand">
            <line className="sb-bow-limb sb-bow-arrow-shaft" x1="46" y1="44" x2="82" y2="44" />
            <polygon className="sb-bow-arrow-tip" points="82,44 90,40 90,48" />
          </g>
          <g className="sb-bow-arrow-on-bow sb-bow-arrow-aim">
            <line className="sb-bow-limb sb-bow-arrow-shaft" x1="38" y1="44" x2="88" y2="44" />
            <polygon className="sb-bow-arrow-tip" points="88,44 96,40 96,48" />
          </g>
        </g>

        {/* Arrow launch point (tip of drawn arrow) */}
        <circle className="sb-bow-nock-point" cx="88" cy="44" r="1" fill="transparent" />

        {/* Head — profile, eyes looking right */}
        <circle className="sb-bow-head" cx="34" cy="18" r="15" />
        <rect className="sb-bow-eye" x="40" y="14" width="2.5" height="2.5" rx="0.5" />
        <rect className="sb-bow-eye" x="40" y="19" width="2.5" height="2.5" rx="0.5" />
      </svg>
    </div>
  );
}
