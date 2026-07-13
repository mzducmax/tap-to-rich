/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CounterDisplayStyle = 'stick' | 'classic' | 'balance';

export const COUNTER_DISPLAY_STYLE_STORAGE_KEY = 'stack_counter_display_style';

export const COUNTER_DISPLAY_STYLE_OPTIONS: {
  id: CounterDisplayStyle;
  label: string;
  description: string;
}[] = [
  {
    id: 'stick',
    label: 'Stick Lines',
    description: 'Hand-drawn SVG, stickman frame',
  },
  {
    id: 'classic',
    label: 'Classic Doodle',
    description: 'Monospace font, doodle frame',
  },
  {
    id: 'balance',
    label: 'Live Balance',
    description: 'Digits only, no panel',
  },
];

const VALID_STYLES: CounterDisplayStyle[] = ['stick', 'classic', 'balance'];

export function loadCounterDisplayStyle(): CounterDisplayStyle {
  const saved = localStorage.getItem(COUNTER_DISPLAY_STYLE_STORAGE_KEY);
  if (saved && VALID_STYLES.includes(saved as CounterDisplayStyle)) {
    return saved as CounterDisplayStyle;
  }
  return 'classic';
}

export function saveCounterDisplayStyle(style: CounterDisplayStyle) {
  localStorage.setItem(COUNTER_DISPLAY_STYLE_STORAGE_KEY, style);
}

export const COUNTER_VISIBLE_STORAGE_KEY = 'stack_show_score_counter';

export function loadCounterVisible(): boolean {
  return localStorage.getItem(COUNTER_VISIBLE_STORAGE_KEY) !== 'false';
}

export function saveCounterVisible(visible: boolean) {
  localStorage.setItem(COUNTER_VISIBLE_STORAGE_KEY, String(visible));
}
