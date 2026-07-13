/**
 * Sky cloud canvas styles — GPU-friendly compositor layer.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const skyCloudStyles = `
  .sky-cloud-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    /* Clouds only ever occupy the sky band — a full-screen layer forces the
       compositor to re-mask/re-composite the entire viewport every canvas
       frame, which tanks FPS. Same fade stops rescaled to the 62% band. */
    height: 62%;
    pointer-events: none;
    overflow: visible;
    z-index: 0;
    contain: layout style;
    isolation: isolate;
    -webkit-mask-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 1) 0%,
      rgba(0, 0, 0, 1) 68%,
      rgba(0, 0, 0, 0.55) 84%,
      rgba(0, 0, 0, 0) 100%
    );
    mask-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 1) 0%,
      rgba(0, 0, 0, 1) 68%,
      rgba(0, 0, 0, 0.55) 84%,
      rgba(0, 0, 0, 0) 100%
    );
  }

  .sky-cloud-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    contain: layout style;
    backface-visibility: hidden;
    transform: translate3d(0, 0, 0);
    will-change: transform;
  }

  .sky-cloud-canvas[data-theme='sunrise'] {
    filter: brightness(1.04) sepia(0.22) saturate(1.35) hue-rotate(-8deg);
  }

  .sky-cloud-canvas[data-theme='sunset'] {
    filter: brightness(1.02) sepia(0.32) saturate(1.5) hue-rotate(-22deg);
  }

  .sky-cloud-canvas[data-theme='meadow'] {
    filter: brightness(1.06) saturate(1.08);
  }
`;
