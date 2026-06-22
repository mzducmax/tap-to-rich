/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const SHEEP_SHOT_COOLDOWN_MS = 380;
export const SHEEP_SHOT_TRAVEL_MS = 140;
export const SCOPE_ZOOM = 1.1;
/** Lens radius as fraction of the shorter screen side */
export const SCOPE_LENS_RATIO = 0.24;
/** Dim overlay outside the scope circle (lower alpha = lighter vignette). */
export const SCOPE_OUTER_DIM_COLOR = 'rgba(12, 16, 24, 0.38)';
/** Edge darkening inside the lens ring. */
export const SCOPE_LENS_EDGE_ALPHA = 0.12;

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
