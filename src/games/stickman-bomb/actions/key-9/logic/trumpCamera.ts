/**
 * Camera zoom toward Trump — CSS transform on GPU layer.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import {
  TRUMP_CAMERA_ZOOM_IN,
  TRUMP_CAMERA_ZOOM_IN_MS,
  TRUMP_CAMERA_ZOOM_OUT,
  TRUMP_CAMERA_ZOOM_OUT_MS,
  TRUMP_CAMERA_ZOOM_OUT_OVERSHOOT,
} from '../config/trumpSpawnConfig';

export type TrumpCameraSpec = {
  stageEl: HTMLElement;
  clipEl?: HTMLElement | null;
  focusX: number;
  focusY: number;
  zoom: number;
  durationMs: number;
};

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - 2 ** (-10 * t);
}

function setClipActive(clipEl: HTMLElement | null | undefined, active: boolean) {
  if (!clipEl) return;
  clipEl.classList.toggle('trump-camera-clip', active);
}

export function animateTrumpCamera({
  stageEl,
  clipEl,
  focusX,
  focusY,
  zoom,
  durationMs,
  ease = 'inOut',
}: TrumpCameraSpec & { ease?: 'inOut' | 'outExpo' }): Promise<void> {
  const rect = stageEl.getBoundingClientRect();
  const originX = ((focusX / rect.width) * 100).toFixed(2);
  const originY = ((focusY / rect.height) * 100).toFixed(2);

  stageEl.style.transformOrigin = `${originX}% ${originY}%`;
  stageEl.classList.add('trump-camera-active');
  setClipActive(clipEl, true);

  const fromScale = parseFloat(stageEl.dataset.trumpScale ?? '1') || 1;
  const toScale = zoom;
  const start = performance.now();

  return new Promise((resolve) => {
    const tick = (now: number) => {
      const raw = Math.min(1, (now - start) / durationMs);
      const t = ease === 'outExpo' ? easeOutExpo(raw) : easeInOutCubic(raw);
      const scale = fromScale + (toScale - fromScale) * t;
      stageEl.style.transform = `scale(${scale})`;
      stageEl.dataset.trumpScale = String(scale);

      if (raw < 1) {
        requestAnimationFrame(tick);
      } else {
        resolve();
      }
    };
    requestAnimationFrame(tick);
  });
}

export function resetTrumpCamera(
  stageEl: HTMLElement,
  clipEl?: HTMLElement | null,
): void {
  stageEl.style.transform = '';
  stageEl.style.transformOrigin = '';
  stageEl.classList.remove('trump-camera-active');
  delete stageEl.dataset.trumpScale;
  setClipActive(clipEl, false);
}

export function zoomTrumpCameraIn(
  stageEl: HTMLElement,
  focusX: number,
  focusY: number,
  clipEl?: HTMLElement | null,
): Promise<void> {
  return animateTrumpCamera({
    stageEl,
    clipEl,
    focusX,
    focusY,
    zoom: TRUMP_CAMERA_ZOOM_IN,
    durationMs: TRUMP_CAMERA_ZOOM_IN_MS,
    ease: 'inOut',
  });
}

/** Zoom back to 1 with brief overshoot — wide feel without scaling below 1. */
export function zoomTrumpCameraOut(
  stageEl: HTMLElement,
  focusX: number,
  focusY: number,
  clipEl?: HTMLElement | null,
): Promise<void> {
  const overshootMs = Math.floor(TRUMP_CAMERA_ZOOM_OUT_MS * 0.38);
  const settleMs = TRUMP_CAMERA_ZOOM_OUT_MS - overshootMs;

  return animateTrumpCamera({
    stageEl,
    clipEl,
    focusX,
    focusY,
    zoom: TRUMP_CAMERA_ZOOM_OUT_OVERSHOOT,
    durationMs: overshootMs,
    ease: 'outExpo',
  }).then(() =>
    animateTrumpCamera({
      stageEl,
      clipEl,
      focusX,
      focusY,
      zoom: TRUMP_CAMERA_ZOOM_OUT,
      durationMs: settleMs,
      ease: 'inOut',
    }),
  ).then(() => {
    resetTrumpCamera(stageEl, clipEl);
  });
}
