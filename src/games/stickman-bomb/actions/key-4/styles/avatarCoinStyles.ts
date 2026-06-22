/**
 * Money train layer — single shared canvas for train + falling coins.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const avatarCoinStyles = `
  .avatar-coin-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: visible;
    z-index: 33;
    contain: layout style;
  }

  .avatar-coin-fx-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 34;
  }
`;
