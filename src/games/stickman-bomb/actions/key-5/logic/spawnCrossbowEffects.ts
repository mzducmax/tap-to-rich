/**
 * Visual bursts when crossbow bolts launch and hit the estate.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import type { Point2 } from '../../shared/animationUtils';
import {
  DIVINE_CROSSBOW_HIT_EFFECT_MS,
  DIVINE_CROSSBOW_LAUNCH_EFFECT_MS,
} from '../config/divineCrossbowConfig';
import {
  acquireHitBurst,
  acquireLaunchBurst,
  acquireVolleyLaunchBurst,
  releaseHitBurst,
  releaseLaunchBurst,
  releaseVolleyLaunchBurst,
} from './divineCrossbowPool';

function scheduleRelease(el: HTMLDivElement, ms: number, release: (el: HTMLDivElement) => void) {
  window.setTimeout(() => release(el), ms);
}

function setBurstPosition(burst: HTMLElement, x: number, y: number) {
  burst.style.transform = `translate3d(${x}px, ${y}px, 0)`;
}

function replayBurst(burst: HTMLElement) {
  burst.classList.remove('divine-crossbow-burst-replay');
  void burst.offsetWidth;
  burst.classList.add('divine-crossbow-burst-replay');
}

export function spawnBoltLaunchEffect(layer: HTMLElement, origin: Point2) {
  const burst = acquireLaunchBurst(layer);
  setBurstPosition(burst, origin.x, origin.y);
  replayBurst(burst);
  scheduleRelease(burst, DIVINE_CROSSBOW_LAUNCH_EFFECT_MS, releaseLaunchBurst);
}

/** Large muzzle flash when the whole volley leaves the crossbow. */
export function spawnVolleyLaunchEffect(layer: HTMLElement, origin: Point2) {
  const burst = acquireVolleyLaunchBurst(layer);
  setBurstPosition(burst, origin.x, origin.y);
  replayBurst(burst);
  scheduleRelease(burst, DIVINE_CROSSBOW_LAUNCH_EFFECT_MS, releaseVolleyLaunchBurst);
}

export function spawnBoltHitEffect(layer: HTMLElement, point: Point2) {
  const burst = acquireHitBurst(layer);
  setBurstPosition(burst, point.x, point.y);
  replayBurst(burst);
  scheduleRelease(burst, DIVINE_CROSSBOW_HIT_EFFECT_MS, releaseHitBurst);
}
