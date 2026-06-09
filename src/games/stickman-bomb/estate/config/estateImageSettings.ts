/**
 * Per-level custom estate images (data URLs in localStorage).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import type { EstateLevel } from './estateConfig';

export const ESTATE_IMAGE_OVERRIDES_STORAGE_KEY = 'stack_estate_image_overrides';

export type EstateImageOverrides = Partial<Record<EstateLevel, string>>;

const ALL_LEVELS: EstateLevel[] = [
  -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5,
];

function levelToKey(level: EstateLevel): string {
  return String(level);
}

function parseLevelKey(key: string): EstateLevel | null {
  const value = Number(key);
  if (!ALL_LEVELS.includes(value as EstateLevel)) return null;
  return value as EstateLevel;
}

export function loadEstateImageOverrides(): EstateImageOverrides {
  try {
    const raw = localStorage.getItem(ESTATE_IMAGE_OVERRIDES_STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const overrides: EstateImageOverrides = {};

    for (const [key, value] of Object.entries(parsed)) {
      const level = parseLevelKey(key);
      if (level === null || typeof value !== 'string' || !value.startsWith('data:image/')) {
        continue;
      }
      overrides[level] = value;
    }

    return overrides;
  } catch {
    return {};
  }
}

export function saveEstateImageOverrides(overrides: EstateImageOverrides) {
  const payload: Record<string, string> = {};
  for (const level of ALL_LEVELS) {
    const url = overrides[level];
    if (url) payload[levelToKey(level)] = url;
  }
  localStorage.setItem(ESTATE_IMAGE_OVERRIDES_STORAGE_KEY, JSON.stringify(payload));
}

export function hasEstateImageOverride(
  level: EstateLevel,
  overrides: EstateImageOverrides,
): boolean {
  return Boolean(overrides[level]);
}

export async function readImageFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }
      reject(new Error('Invalid image data'));
    };
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read image'));
    reader.readAsDataURL(file);
  });
}
