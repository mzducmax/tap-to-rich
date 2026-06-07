/**
 * Shared z-index stack for stickman-bomb canvas layers.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import type { CSSProperties } from 'react';

/** Bottom → top: world → scope → counter → gameplay → hud */
export const GAME_LAYER_Z = {
  world: 10,
  scope: 20,
  counter: 25,
  gameplay: 50,
  hud: 60,
} as const;

export const gameLayerClasses = {
  world: 'absolute inset-0',
  scope: 'absolute inset-0 pointer-events-none',
  counter: 'absolute inset-0 pointer-events-none flex items-center justify-center',
  gameplay: 'absolute inset-0 pointer-events-none',
  hud: 'absolute inset-0 pointer-events-none',
} as const;

export function gameLayerStyle(layer: keyof typeof GAME_LAYER_Z): CSSProperties {
  return { zIndex: GAME_LAYER_Z[layer] };
}
