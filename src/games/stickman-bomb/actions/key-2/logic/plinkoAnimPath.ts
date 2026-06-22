/**
 * Build arc-based animation segments so the ball visibly bounces off pegs.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import {
  PLINKO_BALL_SIZE,
  PLINKO_BOUNCE_SETTLE_MS,
  PLINKO_GRAVITY,
  PLINKO_MAX_SEGMENT_MS,
  PLINKO_MIN_SEGMENT_MS,
  PLINKO_PEG_GAP_Y,
  PLINKO_PEG_SIZE,
} from '../config/plinkoConfig';
import type { PlinkoPoint, PlinkoSimulation } from './plinkoSimulation';

export type PlinkoAnimSegment = {
  from: PlinkoPoint;
  to: PlinkoPoint;
  durationMs: number;
  kind: 'drop' | 'bounce' | 'land';
  pegHit?: { row: number; col: number };
  /** Upward rebound height after peg impact (px). */
  reboundHeight: number;
};

export type PlinkoMotionSample = {
  x: number;
  y: number;
  /** 0..1 squash intensity at peg impact. */
  impact: number;
};

const CONTACT = (PLINKO_BALL_SIZE + PLINKO_PEG_SIZE) * 0.46;
const FALL_PHASE = 0.82;

function pegContact(peg: PlinkoPoint, side: 'left' | 'right'): PlinkoPoint {
  return {
    x: peg.x + (side === 'right' ? CONTACT * 0.82 : -CONTACT * 0.82),
    y: peg.y - CONTACT * 0.58,
  };
}

/** t = sqrt(2h/g) — free-fall time for vertical distance h. */
function fallDurationMs(from: PlinkoPoint, to: PlinkoPoint, kind: PlinkoAnimSegment['kind']): number {
  const dy = Math.abs(to.y - from.y);
  const h = Math.max(dy, PLINKO_PEG_GAP_Y * 0.38);
  const fallMs = Math.sqrt((2 * h) / PLINKO_GRAVITY) * 1000;
  const clamped = Math.min(
    PLINKO_MAX_SEGMENT_MS,
    Math.max(PLINKO_MIN_SEGMENT_MS, fallMs),
  );
  if (kind === 'bounce') return clamped + PLINKO_BOUNCE_SETTLE_MS;
  if (kind === 'land') return clamped * 1.08;
  return clamped;
}

function reboundHeight(dy: number, kind: PlinkoAnimSegment['kind']): number {
  if (kind !== 'bounce') return 0;
  return Math.min(22, Math.max(9, Math.abs(dy) * 0.48));
}

/** Turn simulation peg centers into contact-point paths for rendering. */
export function buildPlinkoAnimSegments(simulation: PlinkoSimulation): PlinkoAnimSegment[] {
  const { path, hitPegs } = simulation;
  const segments: PlinkoAnimSegment[] = [];

  for (let i = 0; i < path.length - 1; i++) {
    const pegCenter = path[i + 1];
    const nextCenter = path[i + 2];
    const isFirst = i === 0;
    const isLast = i === path.length - 2;
    const isPegHit = !isLast;

    let from = path[i];
    let to = pegCenter;

    if (isPegHit && nextCenter) {
      const goesRight = nextCenter.x > pegCenter.x + 0.5;
      to = pegContact(pegCenter, goesRight ? 'left' : 'right');
    }

    if (!isFirst && isPegHit) {
      const prevCenter = path[i];
      const goesRightFromPrev = pegCenter.x > prevCenter.x + 0.5;
      from = pegContact(prevCenter, goesRightFromPrev ? 'right' : 'left');
    }

    const kind: PlinkoAnimSegment['kind'] = isFirst ? 'drop' : isLast ? 'land' : 'bounce';
    const dy = to.y - from.y;

    segments.push({
      from,
      to,
      durationMs: fallDurationMs(from, to, kind),
      kind,
      reboundHeight: reboundHeight(dy, kind),
      pegHit:
        isPegHit && hitPegs[i]
          ? { row: hitPegs[i][0], col: hitPegs[i][1] }
          : undefined,
    });
  }

  return segments;
}

/** Sample motion with gravity (y ∝ t²) and peg rebound on bounce segments. */
export function samplePlinkoSegment(
  from: PlinkoPoint,
  to: PlinkoPoint,
  t: number,
  kind: PlinkoAnimSegment['kind'],
  reboundHeightPx: number,
): PlinkoMotionSample {
  const clamped = Math.max(0, Math.min(1, t));
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  if (kind === 'bounce' && reboundHeightPx > 0) {
    if (clamped <= FALL_PHASE) {
      const ft = clamped / FALL_PHASE;
      const x = from.x + dx * ft;
      const y = from.y + dy * (ft * ft);
      const impact = ft > 0.88 ? Math.min(1, (ft - 0.88) / 0.12) : 0;
      return { x, y, impact };
    }

    const rt = (clamped - FALL_PHASE) / (1 - FALL_PHASE);
    const x = from.x + dx * (FALL_PHASE + rt * (1 - FALL_PHASE));
    const y = to.y - reboundHeightPx * Math.sin(rt * Math.PI);
    return { x, y, impact: Math.max(0, 1 - rt * 1.6) * 0.55 };
  }

  const x = from.x + dx * clamped;
  const y = from.y + dy * (clamped * clamped);
  const impact =
    kind === 'land' && clamped > 0.86
      ? Math.min(1, (clamped - 0.86) / 0.14)
      : 0;

  return { x, y, impact };
}
