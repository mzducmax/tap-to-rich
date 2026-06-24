/**
 * Pig bank layer styles (key P).
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const pigBankStyles = `
  .pig-bank-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 54;
  }

  .pig-bank-fx-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .pig-bank-money-video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center center;
    pointer-events: none;
    opacity: 0;
    transition: opacity 640ms ease-out;
    will-change: opacity;
  }
`;
