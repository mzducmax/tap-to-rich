/**
 * Classic atmosphere themes (gradient sky layers).
 * @license SPDX-License-Identifier: Apache-2.0
 */

export type AtmosphereTheme = 'meadow' | 'day' | 'cyber' | 'sunset' | 'cosmic';

export const ATMOSPHERE_THEMES: AtmosphereTheme[] = [
  'meadow',
  'day',
  'cyber',
  'sunset',
  'cosmic',
];

export const ATMOSPHERE_THEME_STORAGE_KEY = 'stack_background_theme';

export const ATMOSPHERE_THEME_OPTIONS: {
  id: AtmosphereTheme;
  label: string;
  swatchClass: string;
}[] = [
  {
    id: 'meadow',
    label: 'Meadow',
    swatchClass: 'bg-gradient-to-tr from-sky-300 to-green-600',
  },
  {
    id: 'day',
    label: 'Sky Day',
    swatchClass: 'bg-gradient-to-tr from-sky-400 to-amber-200',
  },
  {
    id: 'cyber',
    label: 'Cyber Neon',
    swatchClass: 'bg-gradient-to-tr from-purple-800 to-pink-500',
  },
  {
    id: 'sunset',
    label: 'Sunset Warm',
    swatchClass: 'bg-gradient-to-tr from-purple-950 to-orange-400',
  },
  {
    id: 'cosmic',
    label: 'Cosmic Deep',
    swatchClass:
      'bg-gradient-to-tr from-slate-900 to-indigo-950 border border-indigo-400/30',
  },
];

export function loadAtmosphereTheme(): AtmosphereTheme {
  const saved = localStorage.getItem(ATMOSPHERE_THEME_STORAGE_KEY);
  if (saved && ATMOSPHERE_THEMES.includes(saved as AtmosphereTheme)) {
    return saved as AtmosphereTheme;
  }
  return 'meadow';
}

export function saveAtmosphereTheme(theme: AtmosphereTheme) {
  localStorage.setItem(ATMOSPHERE_THEME_STORAGE_KEY, theme);
}
