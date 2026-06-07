/**
 * Swap flying duck sprite for roast duck plate on hit.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { ROAST_DUCK_URL } from '../config/birdRoastConfig';

export function mountRoastPlate(pigeon: HTMLElement): void {
  pigeon.classList.add('bird-roast-show');
  pigeon.innerHTML = '';

  const img = document.createElement('img');
  img.className = 'bird-roast-plate';
  img.src = ROAST_DUCK_URL;
  img.alt = '';
  img.draggable = false;
  pigeon.appendChild(img);
}
