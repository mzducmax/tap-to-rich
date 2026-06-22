/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type WeaponMode = 'hammer' | 'gun';

export const WEAPON_MODE_STORAGE_KEY = 'stack_weapon_mode';
export const WEAPON_SWITCH_KEY_STORAGE_KEY = 'stack_weapon_switch_key';

export const WEAPON_SWITCH_KEY_OPTIONS: { code: string; label: string }[] = [
  { code: 'Tab', label: 'Tab' },
  { code: 'KeyG', label: 'G' },
  { code: 'Digit2', label: '2' },
  { code: 'KeyX', label: 'X' },
  { code: 'KeyC', label: 'C' },
];

const VALID_MODES: WeaponMode[] = ['hammer', 'gun'];
const VALID_SWITCH_CODES = new Set(WEAPON_SWITCH_KEY_OPTIONS.map((option) => option.code));

export function formatWeaponSwitchKeyLabel(code: string): string {
  const match = WEAPON_SWITCH_KEY_OPTIONS.find((option) => option.code === code);
  if (match) return match.label;
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  return code;
}

export function loadWeaponMode(): WeaponMode {
  const saved = localStorage.getItem(WEAPON_MODE_STORAGE_KEY);
  if (saved && VALID_MODES.includes(saved as WeaponMode)) {
    return saved as WeaponMode;
  }
  return 'hammer';
}

export function saveWeaponMode(mode: WeaponMode) {
  localStorage.setItem(WEAPON_MODE_STORAGE_KEY, mode);
}

export function loadWeaponSwitchKey(): string {
  const saved = localStorage.getItem(WEAPON_SWITCH_KEY_STORAGE_KEY);
  if (saved && VALID_SWITCH_CODES.has(saved)) return saved;
  return 'Tab';
}

export function saveWeaponSwitchKey(code: string) {
  if (!VALID_SWITCH_CODES.has(code)) return;
  localStorage.setItem(WEAPON_SWITCH_KEY_STORAGE_KEY, code);
}
