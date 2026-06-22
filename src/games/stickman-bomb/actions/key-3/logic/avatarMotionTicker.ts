/**
 * Single rAF loop for all avatar float motions (avoids N parallel animation frames).
 * @license SPDX-License-Identifier: Apache-2.0
 */

type TickFn = (now: number) => void;

const ticks = new Set<TickFn>();
let rafId = 0;

function frame(now: number) {
  for (const tick of ticks) tick(now);
  rafId = ticks.size > 0 ? requestAnimationFrame(frame) : 0;
}

export function registerAvatarMotionTick(tick: TickFn) {
  ticks.add(tick);
  if (!rafId) rafId = requestAnimationFrame(frame);
}

export function unregisterAvatarMotionTick(tick: TickFn) {
  ticks.delete(tick);
  if (!ticks.size && rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }
}
