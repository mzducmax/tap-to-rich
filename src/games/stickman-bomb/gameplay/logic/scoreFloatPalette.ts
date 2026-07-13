/**
 * Color palette for +/- score floats by source.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import type { ScoreFloatSource } from '../types/gameplayTypes';

export type ScoreFloatPresentation = {
  fontSize: string;
  strokeWidth: string;
  initialScale: number;
  peakScale: number;
  endScale: number;
  glowBlur: string;
  duration: number;
  riseY: [number, number, number];
};

/** 5-step rise path for motion keyframes (start at 0, end at riseY[2]). */
export function buildScoreFloatRiseKeyframes(
  riseY: [number, number, number],
): [number, number, number, number, number] {
  const [y1, y2, y3] = riseY;
  return [0, y1, y2, y2 + (y3 - y2) * 0.55, y3];
}

const DEFAULT_SCORE_FLOAT: ScoreFloatPresentation = {
  fontSize: '3rem',
  strokeWidth: '1.5px',
  initialScale: 0.55,
  peakScale: 1.25,
  endScale: 0.9,
  glowBlur: '18px',
  duration: 1.25,
  riseY: [-8, -24, -140],
};

export function getScoreFloatPresentation(
  source: ScoreFloatSource,
  amount: number,
): ScoreFloatPresentation {
  if (source === 'hammerMegaCombo') {
    return {
      fontSize: '5.6rem',
      strokeWidth: '4px',
      initialScale: 0.36,
      peakScale: 1.85,
      endScale: 1.05,
      glowBlur: '40px',
      duration: 1.9,
      riseY: [-20, -58, -260],
    };
  }

  if (source === 'hammerCombo') {
    return {
      fontSize: '4.2rem',
      strokeWidth: '3px',
      initialScale: 0.4,
      peakScale: 1.6,
      endScale: 1,
      glowBlur: '30px',
      duration: 1.5,
      riseY: [-16, -46, -210],
    };
  }

  if (source === 'key-0') {
    return {
      fontSize: '4.5rem',
      strokeWidth: '3px',
      initialScale: 0.4,
      peakScale: 1.55,
      endScale: 0.98,
      glowBlur: '28px',
      duration: 1.35,
      riseY: [-8, -28, -150],
    };
  }

  if (source === 'key-2') {
    const big = amount >= 500;
    return {
      fontSize: big ? '5.1rem' : '4.5rem',
      strokeWidth: '4px',
      initialScale: 0.34,
      peakScale: big ? 1.68 : 1.52,
      endScale: 0.94,
      glowBlur: '26px',
      duration: 1.85,
      riseY: [-4, -28, -172],
    };
  }

  if (source === 'key-6') {
    const big = amount >= 300;
    return {
      fontSize: big ? '5.35rem' : '4.7rem',
      strokeWidth: '5px',
      initialScale: 0.38,
      peakScale: big ? 1.72 : 1.58,
      endScale: 0.92,
      glowBlur: '28px',
      duration: 2.05,
      riseY: [0, 0, -210],
    };
  }

  if (source === 'key-3') {
    return {
      fontSize: '5.4rem',
      strokeWidth: '5px',
      initialScale: 0.32,
      peakScale: 1.74,
      endScale: 1.02,
      glowBlur: '34px',
      duration: 1.55,
      riseY: [-12, -40, -188],
    };
  }

  if (source === 'key-9') {
    return {
      fontSize: '5.5rem',
      strokeWidth: '3px',
      initialScale: 0.42,
      peakScale: 1.65,
      endScale: 1.05,
      glowBlur: '32px',
      duration: 1.65,
      riseY: [-12, -36, -180],
    };
  }

  if (source === 'key-p') {
    return {
      fontSize: '4.8rem',
      strokeWidth: '3px',
      initialScale: 0.4,
      peakScale: 1.58,
      endScale: 1.02,
      glowBlur: '28px',
      duration: 1.55,
      riseY: [-10, -32, -168],
    };
  }

  if (source === 'key-11') {
    return {
      fontSize: '3.6rem',
      strokeWidth: '2.5px',
      initialScale: 0.42,
      peakScale: 1.42,
      endScale: 0.96,
      glowBlur: '22px',
      duration: 1.35,
      riseY: [-8, -28, -140],
    };
  }

  if (source === 'key-8') {
    return {
      fontSize: '2.75rem',
      strokeWidth: '2px',
      initialScale: 0.5,
      peakScale: 1.28,
      endScale: 0.94,
      glowBlur: '16px',
      duration: 1.3,
      riseY: [-10, -30, -140],
    };
  }

  if (source === 'key-7') {
    return {
      fontSize: '4.6rem',
      strokeWidth: '3px',
      initialScale: 0.28,
      peakScale: 1.68,
      endScale: 0.96,
      glowBlur: '38px',
      duration: 1.38,
      riseY: [-4, -22, -158],
    };
  }

  if (source === 'key-i') {
    return {
      fontSize: '3.6rem',
      strokeWidth: '2px',
      initialScale: 0.5,
      peakScale: 1.35,
      endScale: 0.92,
      glowBlur: '22px',
      duration: 1.3,
      riseY: [-12, -32, -155],
    };
  }

  if (source === 'market') {
    return {
      fontSize: '5rem',
      strokeWidth: '4px',
      initialScale: 0.38,
      peakScale: 1.62,
      endScale: 0.95,
      glowBlur: '30px',
      duration: 1.65,
      riseY: [-6, -30, -170],
    };
  }

  if (source === 'mole') {
    return {
      fontSize: '2.4rem',
      strokeWidth: '2px',
      initialScale: 0.48,
      peakScale: 1.18,
      endScale: 0.92,
      glowBlur: '16px',
      duration: 1.05,
      riseY: [-6, -22, -88],
    };
  }

  if (amount >= 5000) {
    return {
      fontSize: '4.25rem',
      strokeWidth: '2.5px',
      initialScale: 0.48,
      peakScale: 1.45,
      endScale: 0.95,
      glowBlur: '24px',
      duration: 1.45,
      riseY: [-10, -30, -155],
    };
  }

  return DEFAULT_SCORE_FLOAT;
}

export function formatScoreFloatAmount(amount: number): string {
  return amount.toLocaleString('en-US');
}

export function getScoreFloatPalette(source: ScoreFloatSource) {
  switch (source) {
    case 'hammer':
      return { color: '#f59e0b', glow: 'rgba(245,158,11,0.65)', stroke: '#78350f' };
    case 'hammerCombo':
      return { color: '#f0abfc', glow: 'rgba(217,70,239,0.95)', stroke: '#701a75' };
    case 'hammerMegaCombo':
      return { color: '#fef08a', glow: 'rgba(249,115,22,0.95)', stroke: '#7c2d12' };
    case 'key-0':
      return { color: '#00ff41', glow: 'rgba(0,255,65,0.85)', stroke: '#14532d' };
    case 'key-1':
      return { color: '#f87171', glow: 'rgba(248,113,113,0.85)', stroke: '#7f1d1d' };
    case 'key-2':
      return { color: '#fef08a', glow: 'rgba(253,224,71,0.92)', stroke: '#78350f' };
    case 'key-3':
      return { color: '#fde047', glow: 'rgba(248,113,113,0.92)', stroke: '#7f1d1d' };
    case 'key-4':
      return { color: '#34d399', glow: 'rgba(52,211,153,0.68)', stroke: '#064e3b' };
    case 'key-5':
      return { color: '#38bdf8', glow: 'rgba(56,189,248,0.72)', stroke: '#0c4a6e' };
    case 'key-6':
      return { color: '#facc15', glow: 'rgba(250,204,21,0.68)', stroke: '#713f12' };
    case 'key-7':
      return {
        color: '#fffbf0',
        glow: 'rgba(162,212,255,0.95)',
        stroke: '#1c0c94',
      };
    case 'key-8':
      return {
        color: '#f1f5f9',
        glow: 'rgba(239, 68, 68, 0.9)',
        stroke: '#0f172a',
      };
    case 'key-9':
      return { color: '#fde047', glow: 'rgba(253,224,71,0.95)', stroke: '#1e3a8a' };
    case 'key-p':
      return { color: '#fbbf24', glow: 'rgba(251,191,36,0.9)', stroke: '#14532d' };
    case 'key-11':
      return { color: '#fde047', glow: 'rgba(251,191,36,0.9)', stroke: '#78350f' };
    case 'key-i':
      return { color: '#fb923c', glow: 'rgba(248,113,113,0.9)', stroke: '#7f1d1d' };
    case 'key-u':
      return { color: '#f5402a', glow: 'rgba(220,38,38,0.9)', stroke: '#7f1109' };
    case 'gun':
      return { color: '#60a5fa', glow: 'rgba(96,165,250,0.64)', stroke: '#1e3a8a' };
    case 'sheep':
      return { color: '#86efac', glow: 'rgba(134,239,172,0.64)', stroke: '#14532d' };
    case 'bird':
      return { color: '#4ade80', glow: 'rgba(74,222,128,0.64)', stroke: '#166534' };
    case 'mole':
      return { color: '#f3f4f6', glow: 'rgba(244, 114, 182, 0.72)', stroke: '#6b7280' };
    case 'market':
      return { color: '#f87171', glow: 'rgba(248,113,113,0.85)', stroke: '#7f1d1d' };
    case 'auto':
      return { color: '#10b981', glow: 'rgba(16,185,129,0.64)', stroke: '#065f46' };
    default:
      return { color: '#e5e7eb', glow: 'rgba(229,231,235,0.6)', stroke: '#374151' };
  }
}
