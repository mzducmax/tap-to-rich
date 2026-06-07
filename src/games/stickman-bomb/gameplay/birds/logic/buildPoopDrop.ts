/**
 * Build poop drop — duck-butt height, random vertical column above counter width.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import type { BirdPoopDrop } from '../types/birdTypes';

type BuildPoopDropInput = {
  id: number;
  buttY: number;
  counter: HTMLElement;
  container: HTMLElement;
};

export function buildPoopDrop({
  id,
  buttY,
  counter,
  container,
}: BuildPoopDropInput): BirdPoopDrop {
  const counterRect = counter.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  const insetX = Math.min(10, counterRect.width * 0.05);
  const insetY = Math.min(10, counterRect.height * 0.08);
  const innerW = Math.max(4, counterRect.width - insetX * 2);
  const innerH = Math.max(4, counterRect.height - insetY * 2);
  const counterTop = counterRect.top - containerRect.top;
  const counterBottom = counterRect.bottom - containerRect.top;
  const counterLeft = counterRect.left - containerRect.left;
  const faceLeft = counterLeft + insetX;
  const faceTop = counterTop + insetY;

  const fromY = buttY;
  const spawnX = faceLeft + Math.random() * innerW;
  const hitX = spawnX;
  const hitY = faceTop + Math.random() * innerH;

  const dripEndY = Math.min(
    counterBottom + 6,
    hitY + 24 + Math.random() * Math.max(20, innerH * 0.6),
  );

  const dropDist = Math.max(12, hitY - fromY);
  const fallMs = Math.round(360 + dropDist * 1.1 + Math.random() * 130);
  const stickMs = 220;
  const dripMs = Math.round(1_400 + Math.random() * 900);

  return {
    id,
    fromX: spawnX,
    fromY,
    hitX,
    hitY,
    dripX: hitX,
    dripY: dripEndY,
    fallMs,
    stickMs,
    dripMs,
    totalMs: fallMs + stickMs + dripMs,
    seed: id * 991 + Math.round(hitX * 3 + hitY),
  };
}
