/**
 * Sky cloud canvas styles — GPU-friendly compositor layer.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const skyCloudStyles = `
  .sky-cloud-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: visible;
    z-index: 0;
    contain: layout style;
    isolation: isolate;
    -webkit-mask-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 1) 0%,
      rgba(0, 0, 0, 1) 42%,
      rgba(0, 0, 0, 0.55) 52%,
      rgba(0, 0, 0, 0) 62%
    );
    mask-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 1) 0%,
      rgba(0, 0, 0, 1) 42%,
      rgba(0, 0, 0, 0.55) 52%,
      rgba(0, 0, 0, 0) 62%
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
