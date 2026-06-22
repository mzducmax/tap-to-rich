/**
 * Zoom bottom balance dock — CSS transform (outside camera stage).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import {
  HACKER_PANEL_ZOOM_IN,
  HACKER_PANEL_ZOOM_IN_MS,
  HACKER_PANEL_ZOOM_OUT_MS,
} from '../config/hackerEffectConfig';

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

export type HackerPanelZoomSpec = {
  shellEl: HTMLElement;
  dockEl: HTMLElement;
  zoom?: number;
  durationMs?: number;
};

export function animateHackerPanelZoomIn({
  shellEl,
  dockEl,
  zoom = HACKER_PANEL_ZOOM_IN,
  durationMs = HACKER_PANEL_ZOOM_IN_MS,
}: HackerPanelZoomSpec): Promise<void> {
  dockEl.classList.add('hacker-balance-dock-elevated');
  shellEl.classList.add('hacker-balance-panel-active');
  shellEl.style.transformOrigin = '24% 52%';
  shellEl.style.willChange = 'transform';

  const fromScale = 1;
  const start = performance.now();

  return new Promise((resolve) => {
    const tick = (now: number) => {
      const raw = Math.min(1, (now - start) / durationMs);
      const t = easeInOutCubic(raw);
      const scale = fromScale + (zoom - fromScale) * t;
      shellEl.style.transform = `scale(${scale})`;
      if (raw < 1) requestAnimationFrame(tick);
      else {
        shellEl.dataset.hackerPanelScale = String(zoom);
        resolve();
      }
    };
    requestAnimationFrame(tick);
  });
}

export function animateHackerPanelZoomOut({
  shellEl,
  dockEl,
  durationMs = HACKER_PANEL_ZOOM_OUT_MS,
}: HackerPanelZoomSpec): Promise<void> {
  const fromScale =
    parseFloat(shellEl.dataset.hackerPanelScale ?? '') ||
    parseFloat(shellEl.style.transform.match(/scale\(([^)]+)\)/)?.[1] ?? '1') ||
    1;
  const start = performance.now();

  return new Promise((resolve) => {
    const tick = (now: number) => {
      const raw = Math.min(1, (now - start) / durationMs);
      const t = easeInOutCubic(raw);
      const scale = fromScale + (1 - fromScale) * t;
      shellEl.style.transform = `scale(${scale})`;
      shellEl.dataset.hackerPanelScale = String(scale);
      if (raw < 1) requestAnimationFrame(tick);
      else {
        resetHackerPanelZoom(shellEl, dockEl);
        resolve();
      }
    };
    requestAnimationFrame(tick);
  });
}

export function resetHackerPanelZoom(shellEl: HTMLElement, dockEl: HTMLElement): void {
  shellEl.style.transform = '';
  shellEl.style.transformOrigin = '';
  shellEl.style.willChange = '';
  delete shellEl.dataset.hackerPanelScale;
  shellEl.classList.remove('hacker-balance-panel-active', 'hacker-counter-hacked');
  dockEl.classList.remove('hacker-balance-dock-elevated');
}
