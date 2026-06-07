/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BirdPoopDrop = {
  id: number;
  fromX: number;
  fromY: number;
  hitX: number;
  hitY: number;
  dripX: number;
  dripY: number;
  fallMs: number;
  stickMs: number;
  dripMs: number;
  totalMs: number;
  seed: number;
};

export type BirdSplatMark = {
  id: number;
  x: number;
  y: number;
  seed: number;
  scale: number;
  penalized: boolean;
};

export type BirdBonusFloat = {
  id: number;
};

export type BirdHitEffect = {
  id: number;
  x: number;
  y: number;
};

export type BirdPoopPenaltyFloat = {
  id: number;
  x: number;
  y: number;
};
