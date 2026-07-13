/**
 * Auto-spawn setting for the sheep herd + mouse swarm: when enabled, the two
 * waves take turns appearing back-to-back — sheep herd, then mouse swarm, then
 * sheep herd again — with a configurable gap between one wave leaving and the
 * next appearing. Toggle lives in the game settings panel.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const AUTO_HERD_SPAWN_STORAGE_KEY = 'stack_auto_herd_spawn';

export function loadAutoHerdSpawn(): boolean {
  return localStorage.getItem(AUTO_HERD_SPAWN_STORAGE_KEY) === 'true';
}

export function saveAutoHerdSpawn(enabled: boolean) {
  localStorage.setItem(AUTO_HERD_SPAWN_STORAGE_KEY, String(enabled));
}

/**
 * Editable gap (settings panel) between two consecutive auto-spawn waves. The
 * sheep herd and the mouse swarm take turns appearing back-to-back; this is the
 * pause after one wave has fully left the screen before the next one appears —
 * so the two are never on screen at the same time. Stored in seconds for a
 * friendly UI; the canvas converts to ms.
 */
export const HERD_AUTO_SPAWN_GAP_SEC_DEFAULT = 3;
export const MIN_HERD_AUTO_SPAWN_GAP_SEC = 0;
export const MAX_HERD_AUTO_SPAWN_GAP_SEC = 600;
export const HERD_AUTO_SPAWN_GAP_STORAGE_KEY = 'stack_herd_auto_spawn_gap_sec';

export function clampHerdAutoSpawnGapSec(value: number): number {
  if (!Number.isFinite(value)) return HERD_AUTO_SPAWN_GAP_SEC_DEFAULT;
  return Math.min(
    MAX_HERD_AUTO_SPAWN_GAP_SEC,
    Math.max(MIN_HERD_AUTO_SPAWN_GAP_SEC, Math.round(value)),
  );
}

export function loadHerdAutoSpawnGapSec(): number {
  const saved = localStorage.getItem(HERD_AUTO_SPAWN_GAP_STORAGE_KEY);
  if (saved !== null) {
    const parsed = parseInt(saved, 10);
    if (Number.isFinite(parsed)) return clampHerdAutoSpawnGapSec(parsed);
  }
  return HERD_AUTO_SPAWN_GAP_SEC_DEFAULT;
}

export function saveHerdAutoSpawnGapSec(value: number) {
  localStorage.setItem(
    HERD_AUTO_SPAWN_GAP_STORAGE_KEY,
    String(clampHerdAutoSpawnGapSec(value)),
  );
}
