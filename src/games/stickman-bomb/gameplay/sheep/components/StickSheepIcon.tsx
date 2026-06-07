/**
 * Hand-drawn stick-style sheep icon for the warning banner.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

const STICK = '#1a1a1a';

export function StickSheepIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      width="44"
      height="44"
      aria-hidden
      className="sheep-warning-icon-svg"
    >
      <path
        d="M10 27c-1-6 4-12 11-13 3-4 9-5 14-2 5 2 8 7 7 12 2 5-1 11-7 13-4 2-9 2-13 0-6-2-10-7-12-10z"
        fill="#fff"
        stroke={STICK}
        strokeWidth="2.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx="31" cy="17" r="7" fill="#fff" stroke={STICK} strokeWidth="2.5" />
      <circle cx="28.5" cy="16" r="1.2" fill={STICK} />
      <circle cx="33.5" cy="16" r="1.2" fill={STICK} />
      <path
        d="M29 19.5q2.5 2 5 0"
        fill="none"
        stroke={STICK}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M24 8c-1-3 2-5 4-3M34 9c1-3 4-1 3 2"
        fill="none"
        stroke={STICK}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M16 34l-2 8M22 35l0 9M28 35l1 9M34 33l3 8"
        fill="none"
        stroke={STICK}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
