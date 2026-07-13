/**
 * Tier ornament pieces — wavy crest lines and corner flourishes whose
 * complexity climbs with |level| (tier 0 minimal → tier 6 ornate).
 * Used by the bottom HUD panel to express the current rank.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';

const WAVE_WIDTH = 240;
const WAVE_HEIGHT = 16;

/** Sine-like crest — `phase` flips hump direction so layers interleave. */
function buildWavePath(humps: number, amp: number, phase: 0 | 1): string {
  const mid = WAVE_HEIGHT / 2;
  const seg = WAVE_WIDTH / humps;
  let d = `M 0 ${mid}`;
  for (let i = 0; i < humps; i++) {
    const up = (i + phase) % 2 === 0;
    const controlY = mid + (up ? -amp * 2 : amp * 2);
    d += ` Q ${(i * seg + seg / 2).toFixed(1)} ${controlY.toFixed(1)} ${((i + 1) * seg).toFixed(1)} ${mid}`;
  }
  return d;
}

/** Layered crest — deeper tiers earn extra interleaved wave lines. */
export function CrestOrnament({
  tier,
  accent,
  glow,
  className,
}: {
  tier: number;
  accent: string;
  glow: string;
  className: string;
}) {
  const humps = 2 + tier * 2; // tier 0: 2 gentle humps → tier 6: 14
  const mainPath = useMemo(() => buildWavePath(humps, 4, 0), [humps]);
  const secondPath = useMemo(() => buildWavePath(humps, 2.4, 1), [humps]);
  const thirdPath = useMemo(
    () => buildWavePath(Math.max(2, humps - 2), 5.5, 0),
    [humps],
  );

  return (
    <svg
      viewBox={`0 0 ${WAVE_WIDTH} ${WAVE_HEIGHT}`}
      className={className}
      style={{ filter: `drop-shadow(0 0 5px ${glow})` }}
      preserveAspectRatio="none"
      aria-hidden
    >
      {tier >= 5 && (
        <path
          d={thirdPath}
          fill="none"
          stroke={accent}
          strokeWidth="0.9"
          strokeLinecap="round"
          opacity="0.35"
        />
      )}
      {tier >= 3 && (
        <path
          d={secondPath}
          fill="none"
          stroke={accent}
          strokeWidth="1.3"
          strokeLinecap="round"
          opacity="0.55"
        />
      )}
      <path
        d={mainPath}
        fill="none"
        stroke={accent}
        strokeWidth="2.5"
        strokeLinecap="round"
        className="transition-[stroke] duration-700"
      />
    </svg>
  );
}

/** Corner flourish — arcs, curl, and studs accumulate with tier. */
export function CornerFlourish({
  tier,
  accent,
  glow,
  className,
}: {
  tier: number;
  accent: string;
  glow: string;
  className: string;
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      style={{ filter: `drop-shadow(0 0 4px ${glow})` }}
      aria-hidden
    >
      {/* Base arc — every tier */}
      <path
        d="M 38 3 Q 3 3 3 38"
        fill="none"
        stroke={accent}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {tier >= 1 && (
        <path
          d="M 26 8 Q 8 8 8 26"
          fill="none"
          stroke={accent}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.55"
        />
      )}
      {tier >= 2 && <circle cx="13" cy="13" r="1.7" fill={accent} opacity="0.9" />}
      {tier >= 3 && (
        <path
          d="M 13 13 q 7 -1 7 6 q 0 5 -4.5 5 q -3.5 0 -3.5 -3.5 q 0 -2.5 2.5 -2.5"
          fill="none"
          stroke={accent}
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.75"
        />
      )}
      {tier >= 4 && (
        <>
          <circle cx="24" cy="6" r="1.3" fill={accent} opacity="0.7" />
          <circle cx="6" cy="24" r="1.3" fill={accent} opacity="0.7" />
        </>
      )}
      {tier >= 5 && (
        <>
          <path
            d="M 33 5 Q 5 5 5 33"
            fill="none"
            stroke={accent}
            strokeWidth="0.9"
            strokeLinecap="round"
            opacity="0.35"
          />
          <rect
            x="26.5"
            y="10.5"
            width="3.4"
            height="3.4"
            transform="rotate(45 28.2 12.2)"
            fill={accent}
            opacity="0.85"
          />
          <rect
            x="10.5"
            y="26.5"
            width="3.4"
            height="3.4"
            transform="rotate(45 12.2 28.2)"
            fill={accent}
            opacity="0.85"
          />
        </>
      )}
    </svg>
  );
}
