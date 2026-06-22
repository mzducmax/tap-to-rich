/**
 * Soccer ball kick layer styles (key 8).
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const soccerBallStyles = `
  .soccer-ball-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 38;
    contain: strict;
    isolation: isolate;
  }

  .soccer-ball-fx-canvas {
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
