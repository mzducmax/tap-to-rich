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
        rgba(4, 6, 16, 0.78) 0%,
        rgba(8, 10, 24, 0.62) 28%,
        rgba(12, 14, 30, 0.46) 52%,
        rgba(10, 12, 26, 0.54) 100%
      );
    animation: vertical-lightning-dim-in 1.4s ease-out forwards;
    will-change: opacity;
  }

  .vertical-lightning-strike-pulse .vertical-lightning-storm-dim {
    animation: vertical-lightning-dim-flash 0.28s ease-out;
  }

  @keyframes vertical-lightning-dim-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes vertical-lightning-dim-flash {
    0%   { filter: brightness(1); opacity: 1; }
    32%  { filter: brightness(1.55); opacity: 1; }
    100% { filter: brightness(1); opacity: 1; }
  }

  .vertical-lightning-storm-cloud-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
    contain: strict;
    backface-visibility: hidden;
    transform: translate3d(0, 0, 0);
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
