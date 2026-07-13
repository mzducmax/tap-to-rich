/**
 * External store for the key-7 combo badge.
 *
 * Every estate strike bumps the counter; it auto-clears after a short idle gap
 * so the on-screen "×N COMBO" reads as one continuous assault across the bolts
 * of a press (and across rapid presses chained together).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { VERTICAL_LIGHTNING_COMBO_RESET_MS } from '../config/verticalLightningConfig';

export type VerticalLightningComboSnapshot = {
  /** Current combo count (0 = hidden). */
  count: number;
  /** Monotonic bump id so identical counts still retrigger the pop animation. */
  pulse: number;
};

let snapshot: VerticalLightningComboSnapshot = { count: 0, pulse: 0 };
const listeners = new Set<() => void>();
let resetTimer: number | null = null;

function emit() {
  for (const listener of listeners) listener();
}

function clearTimer() {
  if (resetTimer !== null) {
    window.clearTimeout(resetTimer);
    resetTimer = null;
  }
}

/** Register one more strike and (re)arm the idle reset. */
export function bumpVerticalLightningCombo() {
  snapshot = { count: snapshot.count + 1, pulse: snapshot.pulse + 1 };
  emit();
  clearTimer();
  resetTimer = window.setTimeout(() => {
    resetTimer = null;
    snapshot = { count: 0, pulse: snapshot.pulse };
    emit();
  }, VERTICAL_LIGHTNING_COMBO_RESET_MS);
}

/** Immediately clear the combo (e.g. on game reset). */
export function resetVerticalLightningCombo() {
  clearTimer();
  if (snapshot.count === 0) return;
  snapshot = { count: 0, pulse: snapshot.pulse };
  emit();
}

export function subscribeVerticalLightningCombo(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getVerticalLightningComboSnapshot(): VerticalLightningComboSnapshot {
  return snapshot;
}
