/**
 * GPU-friendly positioning helpers (transform only for motion).
 * @license SPDX-License-Identifier: Apache-2.0
 */

export function setPortalWrapPosition(wrap: HTMLElement, x: number, y: number) {
  wrap.style.transform = `translate3d(${x}px, ${y}px, 0)`;
}

export function setBurstPosition(burst: HTMLElement, x: number, y: number) {
  burst.style.transform = `translate3d(${x}px, ${y}px, 0)`;
}
