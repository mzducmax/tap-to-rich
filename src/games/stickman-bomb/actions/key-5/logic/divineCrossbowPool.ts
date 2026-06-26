/**
 * Reusable DOM nodes for crossbow bolts and burst effects.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import {
  DIVINE_CROSSBOW_BOLT_COUNT,
  DIVINE_CROSSBOW_MAX_CONCURRENT,
} from '../config/divineCrossbowConfig';

const PEAK_BOLTS = DIVINE_CROSSBOW_MAX_CONCURRENT * DIVINE_CROSSBOW_BOLT_COUNT;

const boltPool: HTMLDivElement[] = [];
const launchBurstPool: HTMLDivElement[] = [];
const volleyLaunchBurstPool: HTMLDivElement[] = [];
const hitBurstPool: HTMLDivElement[] = [];
let poolWarmed = false;

function createBolt(): HTMLDivElement {
  const bolt = document.createElement('div');
  bolt.className = 'divine-crossbow-bolt';
  bolt.setAttribute('aria-hidden', 'true');
  bolt.innerHTML =
    '<span class="divine-crossbow-bolt-trail" aria-hidden="true"></span>' +
    '<span class="divine-crossbow-bolt-core" aria-hidden="true"></span>' +
    '<span class="divine-crossbow-bolt-head" aria-hidden="true"></span>' +
    '<span class="divine-crossbow-bolt-glow" aria-hidden="true"></span>' +
    '<span class="divine-crossbow-bolt-spark divine-crossbow-bolt-spark-a" aria-hidden="true"></span>' +
    '<span class="divine-crossbow-bolt-spark divine-crossbow-bolt-spark-b" aria-hidden="true"></span>';
  return bolt;
}

function createLaunchBurst(): HTMLDivElement {
  const burst = document.createElement('div');
  burst.className = 'divine-crossbow-launch-burst';
  burst.setAttribute('aria-hidden', 'true');
  burst.innerHTML =
    '<span class="divine-crossbow-launch-flash"></span>' +
    '<span class="divine-crossbow-launch-ring"></span>';
  return burst;
}

function createVolleyLaunchBurst(): HTMLDivElement {
  const burst = document.createElement('div');
  burst.className = 'divine-crossbow-volley-launch-burst';
  burst.setAttribute('aria-hidden', 'true');
  burst.innerHTML =
    '<span class="divine-crossbow-volley-core-flash"></span>' +
    '<span class="divine-crossbow-volley-ring-a"></span>' +
    '<span class="divine-crossbow-volley-ring-b"></span>' +
    '<span class="divine-crossbow-volley-cone"></span>' +
    '<span class="divine-crossbow-volley-shockwave"></span>';
  return burst;
}

function createHitBurst(): HTMLDivElement {
  const burst = document.createElement('div');
  burst.className = 'divine-crossbow-hit-burst';
  burst.setAttribute('aria-hidden', 'true');
  burst.innerHTML =
    '<span class="divine-crossbow-hit-bloom"></span>' +
    '<span class="divine-crossbow-hit-flash"></span>' +
    '<span class="divine-crossbow-hit-ring"></span>' +
    '<span class="divine-crossbow-hit-spark divine-crossbow-hit-spark-a"></span>' +
    '<span class="divine-crossbow-hit-spark divine-crossbow-hit-spark-b"></span>' +
    '<span class="divine-crossbow-hit-spark divine-crossbow-hit-spark-c"></span>';
  return burst;
}

export function prewarmDivineCrossbowPool() {
  if (poolWarmed) return;
  poolWarmed = true;

  const peakBursts = PEAK_BOLTS * 2;
  while (boltPool.length < PEAK_BOLTS) boltPool.push(createBolt());
  while (launchBurstPool.length < peakBursts) launchBurstPool.push(createLaunchBurst());
  while (volleyLaunchBurstPool.length < DIVINE_CROSSBOW_MAX_CONCURRENT * 2) {
    volleyLaunchBurstPool.push(createVolleyLaunchBurst());
  }
  while (hitBurstPool.length < peakBursts) hitBurstPool.push(createHitBurst());
}

export function acquireBolt(layer: HTMLElement): HTMLDivElement {
  const bolt = boltPool.pop() ?? createBolt();
  bolt.classList.remove('divine-crossbow-bolt-landed', 'divine-crossbow-bolt-flying');
  bolt.style.display = 'block';
  bolt.style.opacity = '1';
  bolt.style.transform = '';
  bolt.querySelectorAll('.divine-crossbow-bolt-trail, .divine-crossbow-bolt-core, .divine-crossbow-bolt-head, .divine-crossbow-bolt-glow, .divine-crossbow-bolt-spark').forEach((el) => {
    el.classList.remove('divine-crossbow-bolt-anim-replay');
    void (el as HTMLElement).offsetWidth;
    el.classList.add('divine-crossbow-bolt-anim-replay');
  });
  layer.appendChild(bolt);
  return bolt;
}

export function releaseBolt(bolt: HTMLDivElement) {
  bolt.style.display = 'none';
  bolt.remove();
  boltPool.push(bolt);
}

export function acquireLaunchBurst(layer: HTMLElement): HTMLDivElement {
  const burst = launchBurstPool.pop() ?? createLaunchBurst();
  burst.style.display = 'block';
  layer.appendChild(burst);
  return burst;
}

export function releaseLaunchBurst(burst: HTMLDivElement) {
  burst.style.display = 'none';
  burst.remove();
  launchBurstPool.push(burst);
}

export function acquireVolleyLaunchBurst(layer: HTMLElement): HTMLDivElement {
  const burst = volleyLaunchBurstPool.pop() ?? createVolleyLaunchBurst();
  burst.style.display = 'block';
  layer.appendChild(burst);
  return burst;
}

export function releaseVolleyLaunchBurst(burst: HTMLDivElement) {
  burst.style.display = 'none';
  burst.remove();
  volleyLaunchBurstPool.push(burst);
}

export function acquireHitBurst(layer: HTMLElement): HTMLDivElement {
  const burst = hitBurstPool.pop() ?? createHitBurst();
  burst.style.display = 'block';
  layer.appendChild(burst);
  return burst;
}

export function releaseHitBurst(burst: HTMLDivElement) {
  burst.style.display = 'none';
  burst.remove();
  hitBurstPool.push(burst);
}
