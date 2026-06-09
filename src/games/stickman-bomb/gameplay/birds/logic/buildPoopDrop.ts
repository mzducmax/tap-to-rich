/**
 * Build poop drop — falls from duck butt to a random point on the estate face.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import type { BirdPoopDrop } from '../types/birdTypes';

type BuildPoopDropInput = {
  id: number;
  buttX: number;
  buttY: number;
  target: HTMLElement;
  container: HTMLElement;
};

export function buildPoopDrop({
  id,
  buttX,
  buttY,
  target,
  container,
}: BuildPoopDropInput): BirdPoopDrop {
  const targetRect = target.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  const insetX = Math.min(10, targetRect.width * 0.05);
  const insetY = Math.min(10, targetRect.height * 0.08);
  const innerW = Math.max(4, targetRect.width - insetX * 2);
  const innerH = Math.max(4, targetRect.height - insetY * 2);
  const targetTop = targetRect.top - containerRect.top;
  const targetBottom = targetRect.bottom - containerRect.top;
  const targetLeft = targetRect.left - containerRect.left;
  const faceLeft = targetLeft + insetX;
  const faceTop = targetTop + insetY;

  const fromX = buttX;
  const fromY = buttY;
  const hitX = faceLeft + Math.random() * innerW;
  const hitY = faceTop + Math.random() * innerH;

  const dripEndY = Math.min(
    targetBottom + 6,
    hitY + 24 + Math.random() * Math.max(20, innerH * 0.6),
  );

  const dropDist = Math.max(12, hitY - fromY);
  const fallMs = Math.round(360 + dropDist * 1.1 + Math.random() * 130);
  const stickMs = 220;
  const dripMs = Math.round(1_400 + Math.random() * 900);

  return {
    id,
    fromX,
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
