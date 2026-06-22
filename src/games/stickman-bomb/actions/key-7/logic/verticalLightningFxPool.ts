/**
 * Pooled DOM FX — subtle cloud pulse at strike origin.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import {
  VERTICAL_LIGHTNING_CLOUD_PULSE_MS,
} from '../config/verticalLightningConfig';

const cloudPool: HTMLDivElement[] = [];

function acquire(pool: HTMLDivElement[], layer: HTMLElement, className: string): HTMLDivElement {
  const el = pool.pop() ?? document.createElement('div');
  // Detach first so className reset happens off-document — no forced layout.
  if (el.parentElement) el.parentElement.removeChild(el);
  el.className = className;
  layer.appendChild(el);
  return el;
}

function release(
  pool: HTMLDivElement[],
  el: HTMLDivElement,
  ms: number,
  activeClass: string,
) {
  window.setTimeout(() => {
    el.classList.remove(activeClass);
    if (el.parentElement) el.parentElement.removeChild(el);
    pool.push(el);
  }, ms);
}

export function spawnVerticalCloudPulse(layer: HTMLElement, cloudX: number) {
  const pulse = acquire(cloudPool, layer, 'vertical-lightning-cloud-pulse');
  pulse.style.transform = `translate3d(${cloudX}px, 0, 0)`;
  // Element was detached → re-attached without active class above: no offsetWidth reflow needed.
  pulse.classList.add('vertical-lightning-cloud-pulse-active');
  release(cloudPool, pulse, VERTICAL_LIGHTNING_CLOUD_PULSE_MS, 'vertical-lightning-cloud-pulse-active');
}
