/**
 * Tomato flight + splat styles (key 13 / [U]).
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const tomatoStyles = `
  .tomato-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 54;
    contain: strict;
    isolation: isolate;
  }

  .tomato-fx-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    contain: strict;
    backface-visibility: hidden;
    transform: translate3d(0, 0, 0);
  }
`;
