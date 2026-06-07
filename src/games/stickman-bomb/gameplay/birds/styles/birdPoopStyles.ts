/**
 * Bird poop visuals — vertical drop, splat stick, drip trail.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const birdPoopStyles = `
  .bird-poop-sequence {
    position: absolute;
    left: 0;
    top: 0;
    pointer-events: none;
    z-index: 26;
    perspective: 480px;
    transform-style: preserve-3d;
  }

  .bird-poop-mover {
    transform-style: preserve-3d;
    will-change: transform, opacity;
  }

  .bird-poop-blob-wrap {
    transform-style: preserve-3d;
    will-change: transform;
  }

  .bird-poop-blob {
    position: relative;
    width: 11px;
    height: 13px;
    margin-left: -5.5px;
    margin-top: -6px;
    border-radius: 48% 52% 50% 50% / 44% 46% 54% 56%;
    background:
      radial-gradient(circle at 34% 26%, #ffffff 0%, #f4efe8 36%, #d4c4b4 68%, #9a7f6a 100%);
    box-shadow:
      inset -1px -2px 4px rgba(55, 38, 24, 0.38),
      inset 1px 1px 3px rgba(255, 255, 255, 0.9),
      0 3px 5px rgba(0, 0, 0, 0.22);
    transform-origin: 50% 90%;
    will-change: transform;
  }

  .bird-poop-impact-splat {
    position: absolute;
    width: 34px;
    height: 26px;
    margin: -13px 0 0 -17px;
    border-radius: 42% 58% 55% 45% / 48% 42% 58% 52%;
    background:
      radial-gradient(ellipse at 38% 32%, #ffffff 0%, #f0ebe4 28%, transparent 62%),
      radial-gradient(ellipse at 62% 58%, rgba(212, 196, 180, 0.95) 0%, rgba(154, 127, 106, 0.72) 55%, transparent 78%);
    box-shadow:
      4px 2px 0 -1px rgba(180, 155, 135, 0.55),
      -3px 4px 0 -2px rgba(200, 175, 155, 0.45),
      0 0 0 1px rgba(255, 255, 255, 0.25) inset;
    opacity: 0;
    transform: scale(0.35);
    will-change: transform, opacity;
  }

  .bird-poop-stain {
    position: absolute;
    width: 30px;
    height: 20px;
    margin: -10px 0 0 -15px;
    border-radius: 46% 54% 52% 48% / 50% 44% 56% 50%;
    background:
      radial-gradient(ellipse at 40% 35%, rgba(255, 255, 255, 0.72) 0%, transparent 48%),
      radial-gradient(ellipse at 55% 60%, rgba(176, 150, 130, 0.58) 0%, rgba(130, 105, 88, 0.38) 62%, transparent 82%);
    box-shadow:
      5px 1px 0 -2px rgba(160, 135, 115, 0.35),
      -4px 3px 0 -3px rgba(175, 150, 130, 0.28);
    opacity: 0;
    will-change: opacity, transform;
  }

  .bird-poop-trail {
    position: absolute;
    left: 50%;
    top: 94%;
    width: 5px;
    margin-left: -2.5px;
    height: 0;
    border-radius: 3px;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.94) 0%,
      rgba(210, 190, 170, 0.8) 45%,
      rgba(141, 110, 99, 0.42) 100%
    );
    transform-origin: top center;
    opacity: 0;
    will-change: height, opacity;
  }
`;
