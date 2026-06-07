/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SHEEP_HIT_PADDING } from '../config/sheepConfig';

export function hitTestSheepAtPoint(
  container: HTMLElement,
  sheepElements: ReadonlyMap<number, HTMLElement>,
  hitIds: ReadonlySet<number>,
  x: number,
  y: number,
  padding = SHEEP_HIT_PADDING,
): number | null {
  const containerRect = container.getBoundingClientRect();

  for (const [id, element] of sheepElements) {
    if (hitIds.has(id)) continue;

    const rect = element.getBoundingClientRect();
    const left = rect.left - containerRect.left - padding;
    const right = rect.right - containerRect.left + padding;
    const top = rect.top - containerRect.top - padding;
    const bottom = rect.bottom - containerRect.top + padding;

    if (x >= left && x <= right && y >= top && y <= bottom) {
      return id;
    }
  }

  return null;
}
