/**
 * Background display mode: classic atmosphere vs score-based level images.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export type BackgroundDisplayMode = 'classic' | 'level';

export const BACKGROUND_DISPLAY_MODE_STORAGE_KEY = 'stack_background_display_mode';

/** @deprecated migrated to BACKGROUND_DISPLAY_MODE_STORAGE_KEY */
const LEGACY_LEVEL_MODE_KEY = 'stack_background_level_mode';

export const BACKGROUND_DISPLAY_MODE_OPTIONS: {
  id: BackgroundDisplayMode;
  label: string;
  description: string;
}[] = [
  {
    id: 'classic',
    label: '1. Classic',
    description: 'Gradient + atmosphere theme',
  },
  {
    id: 'level',
    label: '2. Level',
    description: 'Scene images by score (L-6…L5)',
  },
];

const VALID_MODES: BackgroundDisplayMode[] = ['classic', 'level'];

export function loadBackgroundDisplayMode(): BackgroundDisplayMode {
  const saved = localStorage.getItem(BACKGROUND_DISPLAY_MODE_STORAGE_KEY);
  if (saved && VALID_MODES.includes(saved as BackgroundDisplayMode)) {
    return saved as BackgroundDisplayMode;
  }
  const legacy = localStorage.getItem(LEGACY_LEVEL_MODE_KEY);
  if (legacy === 'auto' || legacy === 'manual') {
    return 'level';
  }
  return 'classic';
}

export function saveBackgroundDisplayMode(mode: BackgroundDisplayMode) {
  localStorage.setItem(BACKGROUND_DISPLAY_MODE_STORAGE_KEY, mode);
}
