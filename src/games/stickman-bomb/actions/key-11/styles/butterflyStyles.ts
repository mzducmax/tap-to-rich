/**
 * Gold nugget flight + impact styles (key 11 / [O]).
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const butterflyStyles = `
  .butterfly-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 54;
    contain: strict;
    isolation: isolate;
  }

  .butterfly-fx-canvas {
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
