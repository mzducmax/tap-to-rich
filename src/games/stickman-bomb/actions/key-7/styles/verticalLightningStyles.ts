/**
 * Vertical lightning — layer chrome + cloud strike pulse (key 7).
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const verticalLightningStyles = `
  .vertical-lightning-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 37;
    contain: layout style;
    isolation: isolate;
  }

  /* Full-screen storm gloom: a steady dark veil with a vignette toward the
     edges. Fades in once and holds for the whole session. */
  .vertical-lightning-storm-dim {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    opacity: 0;
    contain: strict;
    backface-visibility: hidden;
    transform: translate3d(0, 0, 0);
    background:
      linear-gradient(
        180deg,
        rgba(2, 4, 12, 0.93) 0%,
        rgba(5, 7, 16, 0.80) 26%,
        rgba(8, 10, 22, 0.54) 58%,
        rgba(12, 14, 28, 0.22) 84%,
        rgba(14, 16, 32, 0.10) 100%
      );
    animation: vertical-lightning-dim-in 0.85s ease-out forwards;
    will-change: opacity;
  }

  /* Lightning flash: a brief bright veil on top of the gloom, driven only when
     a strike toggles .vertical-lightning-strike-pulse on the layer. Lives on a
     pseudo-element so the base gloom never re-fades. */
  .vertical-lightning-storm-dim::before {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0;
    mix-blend-mode: screen;
    background:
      radial-gradient(
        100% 85% at 50% 26%,
        rgba(228, 236, 252, 0.55) 0%,
        rgba(192, 208, 240, 0.20) 46%,
        rgba(150, 172, 214, 0) 76%
      );
  }

  .vertical-lightning-strike-pulse .vertical-lightning-storm-dim::before {
    animation: vertical-lightning-dim-flash 0.3s ease-out;
  }

  @keyframes vertical-lightning-dim-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes vertical-lightning-dim-flash {
    0%   { opacity: 0; }
    22%  { opacity: 1; }
    100% { opacity: 0; }
  }

  .vertical-lightning-fx-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 3;
    contain: strict;
    backface-visibility: hidden;
    transform: translate3d(0, 0, 0);
  }

  .vertical-lightning-cloud-pulse {
    position: absolute;
    left: 0;
    top: 0;
    width: 0;
    height: 0;
    z-index: 2;
    pointer-events: none;
  }

  .vertical-lightning-cloud-pulse::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 8px;
    width: 120px;
    height: 64px;
    transform: translate(-50%, 0) scale(0.5);
    opacity: 0;
    border-radius: 50%;
    background:
      radial-gradient(
        ellipse 80% 70% at 50% 40%,
        rgba(255, 248, 210, 0.95) 0%,
        rgba(210, 220, 240, 0.55) 42%,
        rgba(180, 190, 210, 0) 72%
      );
  }

  .vertical-lightning-cloud-pulse-active::before {
    animation: vertical-lightning-cloud-flash 0.34s ease-out forwards;
  }

  @keyframes vertical-lightning-cloud-flash {
    0%   { opacity: 0; transform: translate(-50%, 0) scale(0.5); }
    18%  { opacity: 1; transform: translate(-50%, 0) scale(1.1); }
    100% { opacity: 0; transform: translate(-50%, 0) scale(1.35); }
  }
`;
