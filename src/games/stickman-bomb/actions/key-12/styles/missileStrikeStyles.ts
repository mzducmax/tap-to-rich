/**
 * Missile strike overlay styles (key i).
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const MISSILE_LAYER_Z = 205;

export const missileStrikeStyles = `
  .missile-strike-layer {
    position: fixed;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: ${MISSILE_LAYER_Z};
  }

  .missile-strike-fx-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
`;
