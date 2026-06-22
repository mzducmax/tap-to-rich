/**
 * Layer fade / glitch bridge — wall-clock rAF (immune to gameplay pause).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import {
  HACKER_ENTER_MS,
  HACKER_EXIT_MS,
} from '../config/hackerEffectConfig';

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - 2 ** (-10 * t);
}

export type HackerLayerTransitionDirection = 'in' | 'out';

export function animateHackerLayerTransition(
  layer: HTMLElement,
  direction: HackerLayerTransitionDirection,
  durationMs = direction === 'in' ? HACKER_ENTER_MS : HACKER_EXIT_MS,
): Promise<void> {
  const entering = direction === 'in';
  const fromOpacity = entering ? 0 : 1;
  const toOpacity = entering ? 1 : 0;
  const fromBlur = entering ? 6 : 0;
  const toBlur = entering ? 0 : 4;
  const fromScale = entering ? 1.028 : 1;
  const toScale = entering ? 1 : 1.012;
  const ease = entering ? easeOutExpo : easeInOutCubic;
  const start = performance.now();

  layer.style.willChange = 'opacity, filter, transform';
  layer.style.transformOrigin = '50% 50%';

  return new Promise((resolve) => {
    const tick = (now: number) => {
      const raw = Math.min(1, (now - start) / durationMs);
      const t = ease(raw);
      const opacity = fromOpacity + (toOpacity - fromOpacity) * t;
      const blur = fromBlur + (toBlur - fromBlur) * t;
      const scale = fromScale + (toScale - fromScale) * t;

      layer.style.opacity = String(opacity);
      layer.style.filter = blur > 0.05 ? `blur(${blur}px)` : '';
      layer.style.transform = scale === 1 ? '' : `scale(${scale})`;

      if (raw < 1) {
        requestAnimationFrame(tick);
        return;
      }

      if (entering) {
        layer.style.opacity = '1';
        layer.style.filter = '';
        layer.style.transform = '';
      } else {
        layer.style.opacity = '0';
      }
      resolve();
    };

    requestAnimationFrame(tick);
  });
}

export function resetHackerLayerTransition(layer: HTMLElement): void {
  layer.style.opacity = '';
  layer.style.filter = '';
  layer.style.transform = '';
  layer.style.transformOrigin = '';
  layer.style.willChange = '';
  layer.classList.remove(
    'hacker-effect-layer--entering',
    'hacker-effect-layer--exiting',
    'hacker-effect-layer--active',
    'hacker-effect-layer--draining',
  );
}
