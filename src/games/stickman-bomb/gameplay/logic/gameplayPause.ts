/**
 * Shared pause clock for gameplay timers and animations.
 * @license SPDX-License-Identifier: Apache-2.0
 */

let paused = false;
let pauseStartedAt = 0;
let accumulatedPausedMs = 0;

export function setGameplayPaused(next: boolean) {
  if (next === paused) return;

  if (next) {
    paused = true;
    pauseStartedAt = Date.now();
    return;
  }

  accumulatedPausedMs += Date.now() - pauseStartedAt;
  paused = false;
}

export function isGameplayPaused() {
  return paused;
}

export function resetGameplayPauseClock() {
  paused = false;
  pauseStartedAt = 0;
  accumulatedPausedMs = 0;
}

/** Shift cycle anchors forward when gameplay resumes after a pause. */
export function shiftAnchorsForPause(
  anchors: Array<{ current: number }>,
  pausedAt: number,
  resumedAt: number,
) {
  const delta = resumedAt - pausedAt;
  if (delta <= 0) return;
  for (const anchor of anchors) {
    anchor.current += delta;
  }
}

/**
 * Count down `delayMs` of active gameplay time, then run `fn`.
 * Timer does not advance while `isActive` returns false.
 */
export function scheduleWhenGameplayActive(
  isActive: () => boolean,
  fn: () => void,
  delayMs: number,
): () => void {
  let cancelled = false;
  let remaining = delayMs;
  let lastTick = Date.now();
  let timeoutId = 0;

  const step = () => {
    if (cancelled) return;

    if (!isActive()) {
      lastTick = Date.now();
      timeoutId = window.setTimeout(step, 50);
      return;
    }

    const now = Date.now();
    remaining -= now - lastTick;
    lastTick = now;

    if (remaining <= 0) {
      fn();
      return;
    }

    timeoutId = window.setTimeout(step, Math.min(remaining, 50));
  };

  lastTick = Date.now();
  timeoutId = window.setTimeout(step, Math.min(delayMs, 50));

  return () => {
    cancelled = true;
    window.clearTimeout(timeoutId);
  };
}
