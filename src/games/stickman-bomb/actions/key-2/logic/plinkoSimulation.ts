/**
 * Plinko path simulation — biased peg bounces from a user-chosen drop X.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import {
  PLINKO_BOARD_H,
  PLINKO_BOARD_W,
  PLINKO_CENTER_REPEL,
  PLINKO_CENTER_REPEL_DRIFT,
  PLINKO_CENTER_REPEL_CORE,
  PLINKO_MID_BIAS,
  PLINKO_MID_BIAS_MAX,
  PLINKO_MID_DEPTH,
  PLINKO_MID_DRIFT,
  PLINKO_MID_RAMP,
  PLINKO_TRANSFER_BIAS,
  PLINKO_TRANSFER_BIAS_MAX,
  PLINKO_TRANSFER_DEPTH,
  PLINKO_TRANSFER_DRIFT_END,
  PLINKO_TRANSFER_DRIFT_START,
  PLINKO_DROP_Y,
  PLINKO_EDGE_BIAS,
  PLINKO_EDGE_BIAS_MAX,
  PLINKO_JACKPOT_DRIFT,
  PLINKO_JACKPOT_EXTRA,
  PLINKO_JACKPOT_DEPTH,
  PLINKO_MULTIPLIERS,
  PLINKO_PEG_GAP_X,
  PLINKO_PEG_GAP_Y,
  PLINKO_ROWS,
  PLINKO_SLOT_COUNT,
  PLINKO_TOP_PADDING,
  PLINKO_TOP_PEGS,
} from '../config/plinkoConfig';

export type PlinkoPoint = { x: number; y: number };

export type PlinkoSimulation = {
  slotIndex: number;
  multiplier: number;
  /** Bounce points from drop start through each peg to slot center. */
  path: PlinkoPoint[];
  slotCenters: PlinkoPoint[];
  /** Peg grid indices hit along the path — [row, col] per bounce. */
  hitPegs: Array<[number, number]>;
};

export type PlinkoDropZone = {
  y: number;
  minX: number;
  maxX: number;
  centerX: number;
};

function pegsInRow(row: number): number {
  return PLINKO_TOP_PEGS + row;
}

function rowOffsetX(row: number): number {
  const pegs = pegsInRow(row);
  const rowWidth = (pegs - 1) * PLINKO_PEG_GAP_X;
  const maxWidth = (pegsInRow(PLINKO_ROWS - 1) - 1) * PLINKO_PEG_GAP_X;
  return (maxWidth - rowWidth) / 2;
}

function boardPaddingX(): number {
  const maxWidth = (pegsInRow(PLINKO_ROWS - 1) - 1) * PLINKO_PEG_GAP_X;
  return Math.max(0, (PLINKO_BOARD_W - maxWidth) / 2);
}

function pegPosition(row: number, pegCol: number): PlinkoPoint {
  const offsetX = rowOffsetX(row) + boardPaddingX();
  return {
    x: offsetX + pegCol * PLINKO_PEG_GAP_X,
    y: PLINKO_TOP_PADDING + row * PLINKO_PEG_GAP_Y,
  };
}

function slotCenters(): PlinkoPoint[] {
  const offsetX = rowOffsetX(PLINKO_ROWS - 1) + boardPaddingX();
  const y = PLINKO_BOARD_H - 58;
  return Array.from({ length: PLINKO_SLOT_COUNT }, (_, i) => ({
    x: offsetX + i * PLINKO_PEG_GAP_X,
    y,
  }));
}

function nearestPegCol(row: number, x: number): number {
  const count = pegsInRow(row);
  let bestCol = 0;
  let bestDist = Infinity;
  for (let col = 0; col < count; col++) {
    const peg = pegPosition(row, col);
    const dist = Math.abs(peg.x - x);
    if (dist < bestDist) {
      bestDist = dist;
      bestCol = col;
    }
  }
  return bestCol;
}

function centerSlotIndex(): number {
  return (PLINKO_SLOT_COUNT - 1) / 2;
}

/** Right-bounce probability — grey-zone repel, mid outward, jackpot tier (monotonic 0.5× → 3200×). */
export function plinkoBiasRightProb(row: number, bounceRights: number): number {
  const center = centerSlotIndex();
  const remaining = PLINKO_ROWS - row;
  const projected = bounceRights + remaining * 0.5;
  const drift = projected - center;
  const absDrift = Math.abs(drift);
  const sign = drift > 0 ? 1 : drift < 0 ? -1 : 0;

  if (absDrift >= PLINKO_JACKPOT_DRIFT) {
    const depth = absDrift - PLINKO_JACKPOT_DRIFT;
    const edgeBias = Math.min(
      PLINKO_EDGE_BIAS_MAX,
      PLINKO_EDGE_BIAS + depth * PLINKO_JACKPOT_DEPTH + PLINKO_JACKPOT_EXTRA,
    );
    return 0.5 + sign * edgeBias;
  }

  if (absDrift >= PLINKO_MID_DRIFT) {
    const depth = absDrift - PLINKO_MID_DRIFT;
    const ramp = Math.max(0.01, PLINKO_MID_RAMP);
    const scale = Math.min(1, depth / ramp);
    const midBias = Math.min(
      PLINKO_MID_BIAS_MAX,
      (PLINKO_MID_BIAS + depth * PLINKO_MID_DEPTH) * scale,
    );
    return 0.5 + sign * midBias;
  }

  if (
    absDrift >= PLINKO_TRANSFER_DRIFT_START &&
    absDrift < PLINKO_TRANSFER_DRIFT_END
  ) {
    const depth = absDrift - PLINKO_TRANSFER_DRIFT_START;
    const transferBias = Math.min(
      PLINKO_TRANSFER_BIAS_MAX,
      PLINKO_TRANSFER_BIAS + depth * PLINKO_TRANSFER_DEPTH,
    );
    return 0.5 + sign * transferBias;
  }

  if (PLINKO_CENTER_REPEL > 0 && absDrift <= PLINKO_CENTER_REPEL_DRIFT) {
    const repel = Math.min(
      PLINKO_CENTER_REPEL,
      PLINKO_CENTER_REPEL * 0.45 + absDrift * 0.03,
    );
    if (absDrift <= PLINKO_CENTER_REPEL_CORE) return 0.5 + sign * repel;
    if (drift > 0.2) return 0.5 + repel * 0.5;
    if (drift < -0.2) return 0.5 - repel * 0.5;
  }

  return 0.5;
}

function rollBiasedDirection(row: number, bounceRights: number): boolean {
  return Math.random() < plinkoBiasRightProb(row, bounceRights);
}

export function plinkoDropZone(): PlinkoDropZone {
  const leftPeg = pegPosition(0, 0);
  const rightPeg = pegPosition(0, pegsInRow(0) - 1);
  const margin = PLINKO_PEG_GAP_X * 0.55;
  const minX = leftPeg.x - margin;
  const maxX = rightPeg.x + margin;
  return {
    y: PLINKO_DROP_Y,
    minX,
    maxX,
    centerX: (minX + maxX) / 2,
  };
}

export function clampDropX(x: number): number {
  const zone = plinkoDropZone();
  return Math.max(zone.minX, Math.min(zone.maxX, x));
}

/** Simulate a full drop after the user releases the ball at `startX`. */
export function simulatePlinkoFromDrop(startX: number): PlinkoSimulation {
  const centers = slotCenters();
  const dropX = clampDropX(startX);
  const directions: boolean[] = [];
  let bounceRights = 0;

  for (let row = 0; row < PLINKO_ROWS; row++) {
    const goRight = rollBiasedDirection(row, bounceRights);
    directions.push(goRight);
    if (goRight) bounceRights += 1;
  }

  const slotIndex = Math.max(0, Math.min(PLINKO_SLOT_COUNT - 1, bounceRights));
  const firstCol = nearestPegCol(0, dropX);
  const centerAnchor = Math.floor((PLINKO_TOP_PEGS - 1) / 2);

  const path: PlinkoPoint[] = [{ x: dropX, y: PLINKO_DROP_Y }];
  const hitPegs: Array<[number, number]> = [];
  bounceRights = 0;

  for (let row = 0; row < PLINKO_ROWS; row++) {
    const pegCol =
      row === 0
        ? firstCol
        : Math.min(
            Math.max(0, bounceRights + firstCol - centerAnchor),
            pegsInRow(row) - 1,
          );
    hitPegs.push([row, pegCol]);
    path.push(pegPosition(row, pegCol));
    if (directions[row]) bounceRights += 1;
  }

  path.push(centers[slotIndex]);

  return {
    slotIndex,
    multiplier: PLINKO_MULTIPLIERS[slotIndex] ?? 1,
    path,
    slotCenters: centers,
    hitPegs,
  };
}

/** Index of the highest multiplier slot(s) — both outer edges share the max. */
export function plinkoMaxMultiplierSlotIndices(): number[] {
  const max = Math.max(...PLINKO_MULTIPLIERS);
  return PLINKO_MULTIPLIERS.map((m, i) => (m === max ? i : -1)).filter((i) => i >= 0);
}

function computeBiasedSlotProbabilities(): number[] {
  const dp: number[][] = Array.from({ length: PLINKO_ROWS + 1 }, () =>
    Array(PLINKO_ROWS + 1).fill(0),
  );
  dp[0][0] = 1;

  for (let row = 0; row < PLINKO_ROWS; row++) {
    for (let rights = 0; rights <= row; rights++) {
      const p = dp[row][rights];
      if (p <= 0) continue;
      const pRight = plinkoBiasRightProb(row, rights);
      dp[row + 1][rights] += p * (1 - pRight);
      dp[row + 1][rights + 1] += p * pRight;
    }
  }

  return Array.from({ length: PLINKO_SLOT_COUNT }, (_, i) => dp[PLINKO_ROWS][i] ?? 0);
}

let cachedBiasedProbabilities: number[] | null = null;

function biasedSlotProbabilities(): readonly number[] {
  if (!cachedBiasedProbabilities) {
    cachedBiasedProbabilities = computeBiasedSlotProbabilities();
  }
  return cachedBiasedProbabilities;
}

/** Per-slot landing probability (center- + edge-biased peg bounces). */
export function plinkoSlotProbability(slotIndex: number): number {
  if (slotIndex < 0 || slotIndex >= PLINKO_SLOT_COUNT) return 0;
  return biasedSlotProbabilities()[slotIndex] ?? 0;
}

/** All slot probabilities indexed by slot. */
export function plinkoAllSlotProbabilities(): readonly number[] {
  return biasedSlotProbabilities();
}

export function formatPlinkoProbability(probability: number): string {
  const pct = probability * 100;
  if (pct >= 10) return `${pct.toFixed(1)}%`;
  if (pct >= 1) return `${pct.toFixed(2)}%`;
  if (pct >= 0.1) return `${pct.toFixed(3)}%`;
  if (pct >= 0.01) return `${pct.toFixed(4)}%`;
  return `${pct.toFixed(5)}%`;
}

/** @deprecated Use simulatePlinkoFromDrop with zone center. */
export function simulatePlinko(): PlinkoSimulation {
  return simulatePlinkoFromDrop(plinkoDropZone().centerX);
}

export function plinkoBoardMetrics() {
  const padX = boardPaddingX();
  const pegRows = Array.from({ length: PLINKO_ROWS }, (_, row) => {
    const count = pegsInRow(row);
    const offsetX = rowOffsetX(row) + padX;
    return Array.from({ length: count }, (_, col) => ({
      x: offsetX + col * PLINKO_PEG_GAP_X,
      y: PLINKO_TOP_PADDING + row * PLINKO_PEG_GAP_Y,
    }));
  });

  return {
    width: PLINKO_BOARD_W,
    height: PLINKO_BOARD_H,
    pegRows,
    slotCenters: slotCenters(),
    dropZone: plinkoDropZone(),
  };
}
