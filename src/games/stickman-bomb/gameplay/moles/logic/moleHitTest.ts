/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MOLE_HIT_PADDING } from '../config/moleConfig';
import type { MoleVisibility } from '../types/moleTypes';

const HITTABLE: ReadonlySet<MoleVisibility> = new Set(['rising', 'up']);

/** Visible mouse body sits in the upper portion once the mole has started rising. */
function getHitRect(
  rect: DOMRect,
  visibility: MoleVisibility,
  padding: number,
) {
  const heightRatio = visibility === 'up' ? 0.88 : 0.72;
  const bodyHeight = rect.height * heightRatio;
  const top = rect.top + rect.height - bodyHeight;

  return {
    left: rect.left - padding,
    right: rect.right + padding,
    top: top - padding * 0.35,
    bottom: rect.bottom + padding * 0.25,
  };
}

export function hitTestMoleAtPoint(
  container: HTMLElement,
  moleElements: ReadonlyMap<number, HTMLElement>,
  hitIds: ReadonlySet<number>,
  visibility: ReadonlyMap<number, MoleVisibility>,
  x: number,
  y: number,
  padding = MOLE_HIT_PADDING,
): number | null {
  const containerRect = container.getBoundingClientRect();
  const clientX = containerRect.left + x;
  const clientY = containerRect.top + y;

  let bestId: number | null = null;
  let bestArea = Infinity;

  for (const [id, element] of moleElements) {
    if (hitIds.has(id)) continue;

    const vis = visibility.get(id);
    if (!vis || !HITTABLE.has(vis)) continue;

    const rect = element.getBoundingClientRect();
    const hit = getHitRect(rect, vis, padding);

    if (
      clientX < hit.left ||
      clientX > hit.right ||
      clientY < hit.top ||
      clientY > hit.bottom
    ) {
      continue;
    }

    const area = rect.width * rect.height;
    if (area < bestArea) {
      bestArea = area;
      bestId = id;
    }
  }

  return bestId;
}
