/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const SHEEP_SHOT_COOLDOWN_MS = 380;
export const SHEEP_SHOT_TRAVEL_MS = 140;
export const SCOPE_ZOOM = 1.14;
/** Lens radius as fraction of the shorter screen side */
export const SCOPE_LENS_RATIO = 0.24;

export const scopeViewStyles = `
  .scope-content-layer {
    transform: scale(${SCOPE_ZOOM});
    transform-origin: var(--scope-x, 50%) var(--scope-y, 50%);
    will-change: transform, transform-origin;
  }

  .gun-scope-stage {
    overflow: hidden;
  }
`;
