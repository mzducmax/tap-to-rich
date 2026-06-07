/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function randomCounterTarget(counter: HTMLElement, container: HTMLElement) {
  const containerRect = container.getBoundingClientRect();
  const counterRect = counter.getBoundingClientRect();
  const insetX = Math.min(14, counterRect.width * 0.12);
  const insetY = Math.min(10, counterRect.height * 0.12);
  const innerW = Math.max(4, counterRect.width - insetX * 2);
  const innerH = Math.max(4, counterRect.height - insetY * 2);

  return {
    x: counterRect.left - containerRect.left + insetX + Math.random() * innerW,
    y: counterRect.top - containerRect.top + insetY + Math.random() * innerH,
  };
}
