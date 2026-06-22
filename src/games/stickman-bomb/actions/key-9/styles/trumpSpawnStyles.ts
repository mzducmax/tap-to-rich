/**
 * Trump spawn layer styles (key 9).
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const trumpSpawnStyles = `
  .trump-spawn-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 55;
  }

  .trump-spawn-fx-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .trump-camera-stage {
    position: absolute;
    inset: 0;
    will-change: transform;
  }

  .trump-camera-stage.trump-camera-active {
    filter: saturate(1.1) contrast(1.03);
  }

  .trump-camera-clip {
    overflow: hidden !important;
  }
`;
