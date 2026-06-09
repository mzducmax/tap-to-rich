/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { isGameplayPaused } from '../gameplay/logic/gameplayPause';

export function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    let elapsed = 0;
    let last = Date.now();

    const tick = () => {
      if (isGameplayPaused()) {
        last = Date.now();
        setTimeout(tick, 32);
        return;
      }

      const now = Date.now();
      elapsed += now - last;
      last = now;

      if (elapsed >= ms) resolve();
      else setTimeout(tick, Math.min(32, ms - elapsed));
    };

    tick();
  });
}

export async function waitForRefs(
  refs: Array<React.RefObject<HTMLElement | null>>,
  attempts = 20,
) {
  for (let i = 0; i < attempts; i++) {
    if (refs.every((ref) => ref.current)) return true;
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  }
  return refs.every((ref) => ref.current);
}

type EaseMode = 'easeOut' | 'easeIn' | 'easeInOut';

function easeProgress(p: number, ease: EaseMode): number {
  if (ease === 'easeInOut') {
    return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
  }
  if (ease === 'easeIn') return Math.pow(p, 2.4);
  return 1 - Math.pow(1 - p, 3);
}

export type Point2 = { x: number; y: number };

export type MoveOptions = {
  bob?: number;
  facing?: 1 | -1;
  /** Vertical run — horizontal bob instead of vertical */
  verticalRun?: boolean;
};

function applyFacing(el: HTMLElement, facing: number) {
  el.style.transform = `scaleX(${facing})`;
}

/** Move to a point (2D run). */
export function move2d(
  el: HTMLElement,
  start: Point2,
  end: Point2,
  duration: number,
  ease: EaseMode = 'easeOut',
  options: MoveOptions = {},
) {
  const bob = options.bob ?? 4;
  const facing = options.facing ?? 1;
  const verticalRun = options.verticalRun ?? false;

  return new Promise<void>((resolve) => {
    let startT: number | null = null;
    let pauseFrame: number | null = null;
    const dist = Math.hypot(end.x - start.x, end.y - start.y);

    function step(t: number) {
      if (isGameplayPaused()) {
        if (pauseFrame === null) pauseFrame = t;
        requestAnimationFrame(step);
        return;
      }

      if (pauseFrame !== null) {
        if (startT !== null) startT += t - pauseFrame;
        pauseFrame = null;
      }

      if (startT === null) startT = t;
      const raw = Math.min((t - startT) / duration, 1);
      const p = easeProgress(raw, ease);
      const x = start.x + (end.x - start.x) * p;
      const y = start.y + (end.y - start.y) * p;
      const stride = raw * Math.PI * 14;
      const bobAmp = bob > 0 && dist > 0 ? bob * (1 - raw * 0.1) : 0;
      const wobble = bobAmp > 0 ? Math.abs(Math.sin(stride)) * bobAmp : 0;

      if (verticalRun) {
        el.style.left = `${x + wobble}px`;
        el.style.top = `${y}px`;
      } else {
        el.style.left = `${x}px`;
        el.style.top = `${y + wobble}px`;
      }
      el.style.bottom = 'auto';
      applyFacing(el, facing);

      if (raw < 1) {
        requestAnimationFrame(step);
      } else {
        applyFacing(el, facing);
        resolve();
      }
    }

    requestAnimationFrame(step);
  });
}

/** Gentle toss upward (arc curve). */
export function gentleTossUp(
  el: HTMLElement,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  duration = 420,
) {
  return new Promise<void>((resolve) => {
    let startT: number | null = null;
    let pauseFrame: number | null = null;
    const arc = Math.max(28, Math.abs(y1 - y2) * 0.18);

    function step(t: number) {
      if (isGameplayPaused()) {
        if (pauseFrame === null) pauseFrame = t;
        requestAnimationFrame(step);
        return;
      }

      if (pauseFrame !== null) {
        if (startT !== null) startT += t - pauseFrame;
        pauseFrame = null;
      }

      if (startT === null) startT = t;
      const raw = Math.min((t - startT) / duration, 1);
      const p = 1 - Math.pow(1 - raw, 2.2);
      const x = x1 + (x2 - x1) * p;
      const baseY = y1 + (y2 - y1) * p;
      const y = baseY - arc * Math.sin(Math.PI * p);

      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.transform = `rotate(${-p * 35}deg) scale(${1 + Math.sin(Math.PI * p) * 0.08})`;

      if (raw < 1) {
        requestAnimationFrame(step);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(step);
  });
}

/** Gentle drop from hand onto the counter. */
export function gentleDrop(
  el: HTMLElement,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  duration = 340,
) {
  return new Promise<void>((resolve) => {
    let startT: number | null = null;
    let pauseFrame: number | null = null;

    function step(t: number) {
      if (isGameplayPaused()) {
        if (pauseFrame === null) pauseFrame = t;
        requestAnimationFrame(step);
        return;
      }

      if (pauseFrame !== null) {
        if (startT !== null) startT += t - pauseFrame;
        pauseFrame = null;
      }

      if (startT === null) startT = t;
      const raw = Math.min((t - startT) / duration, 1);
      const p = raw * raw;
      const x = x1 + (x2 - x1) * p;
      const y = y1 + (y2 - y1) * p;

      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.transform = `rotate(${p * 25}deg) scale(${1 - p * 0.05})`;

      if (raw < 1) {
        requestAnimationFrame(step);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(step);
  });
}

/** Gentle roll on the ground then stop. */
export function rollOnGround(
  el: HTMLElement,
  startX: number,
  endX: number,
  groundY: number,
  duration = 380,
) {
  return new Promise<void>((resolve) => {
    let startT: number | null = null;
    let pauseFrame: number | null = null;

    function step(t: number) {
      if (isGameplayPaused()) {
        if (pauseFrame === null) pauseFrame = t;
        requestAnimationFrame(step);
        return;
      }

      if (pauseFrame !== null) {
        if (startT !== null) startT += t - pauseFrame;
        pauseFrame = null;
      }

      if (startT === null) startT = t;
      const raw = Math.min((t - startT) / duration, 1);
      const p = 1 - Math.pow(1 - raw, 2);
      const x = startX + (endX - startX) * p;
      const bounce = Math.abs(Math.sin(raw * Math.PI * 2)) * 3 * (1 - raw);

      el.style.left = `${x}px`;
      el.style.top = `${groundY - bounce}px`;
      el.style.transform = `rotate(${p * 180}deg)`;

      if (raw < 1) {
        requestAnimationFrame(step);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(step);
  });
}
