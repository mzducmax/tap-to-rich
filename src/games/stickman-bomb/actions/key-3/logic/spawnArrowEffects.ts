/**
 * Visual bursts when avatar arrows launch and stick — canvas particle batch.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import type { Point2 } from '../../shared/animationUtils';
import {
  spawnLaunchBurstCanvas,
  spawnStickBurstCanvas,
} from './avatarStrikeCanvas';

export function spawnArrowLaunchEffect(
  _layer: HTMLElement,
  origin: Point2,
  angleRad: number,
) {
  spawnLaunchBurstCanvas(origin, angleRad);
}

export function spawnArrowStickEffect(
  _layer: HTMLElement,
  tip: Point2,
  angleRad: number,
) {
  spawnStickBurstCanvas(tip, angleRad);
}
