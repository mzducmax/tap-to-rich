/**
 * Bird flock visuals — duck sprite sheet animation (per-frame JS translate).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import {
  ROAST_DISPLAY_H,
  ROAST_DISPLAY_W,
} from '../config/birdRoastConfig';
import {
  BIRD_SPRITE_DISPLAY_H,
  BIRD_SPRITE_DISPLAY_W,
  DUCK_SHEET_DISPLAY_H,
  DUCK_SHEET_DISPLAY_W,
} from '../config/birdSpriteConfig';
import { BIRD_CROSS_END, BIRD_CROSS_START } from '../logic/birdPosition';

export const birdStyles = `
  .bird-flock-layer {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 18;
    container-type: inline-size;
    contain: layout paint style;
  }

  .bird-pigeon-track {
    position: absolute;
    left: 0;
    top: var(--bird-top, 10%);
    width: 0;
    height: 0;
    will-change: transform;
    transform: translate3d(calc(${BIRD_CROSS_START} * 100cqw), 0, 0);
    animation: bird-fly-across var(--bird-cross-ms, 5800ms) linear forwards;
    animation-delay: var(--bird-delay, 0ms);
  }

  .bird-pigeon-drop {
    position: relative;
  }

  .bird-pigeon {
    position: relative;
    width: ${BIRD_SPRITE_DISPLAY_W}px;
    height: ${BIRD_SPRITE_DISPLAY_H}px;
    line-height: 0;
    transform-origin: center center;
    /* Sprite faces right; flock flies right → left */
    transform: scaleX(-1) scale(var(--bird-scale, 1));
    will-change: transform, opacity;
  }

  .bird-duck-viewport {
    width: ${BIRD_SPRITE_DISPLAY_W}px;
    height: ${BIRD_SPRITE_DISPLAY_H}px;
    overflow: hidden;
    position: relative;
    isolation: isolate;
    contain: strict;
    filter: drop-shadow(2px 4px 3px rgba(0, 0, 0, 0.28));
  }

  .bird-duck-sheet {
    position: absolute;
    left: 0;
    top: 0;
    width: ${DUCK_SHEET_DISPLAY_W}px;
    height: ${DUCK_SHEET_DISPLAY_H}px;
    max-width: none;
    pointer-events: none;
    user-select: none;
    will-change: transform;
    mix-blend-mode: screen;
  }

  .bird-pigeon-track-hit {
    animation-play-state: paused !important;
  }

  .bird-pigeon-drop-hit {
    will-change: transform;
    animation: bird-pigeon-drop-fall var(--bird-fall-ms, 800ms) cubic-bezier(0.42, 0, 0.95, 0.65) 0.16s forwards;
  }

  .bird-pigeon-drop-hit::before,
  .bird-pigeon-drop-hit::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 55%;
    width: 70%;
    height: 80%;
    border-radius: 50%;
    pointer-events: none;
    z-index: 2;
    background: radial-gradient(
      circle,
      rgba(245, 245, 245, 0.95) 0%,
      rgba(200, 200, 200, 0.55) 35%,
      rgba(160, 160, 160, 0.2) 58%,
      transparent 72%
    );
    opacity: 0;
    animation: bird-hit-smoke-puff 0.42s ease-out forwards;
  }

  .bird-pigeon-drop-hit::after {
    left: 42%;
    top: 48%;
    width: 55%;
    height: 65%;
    animation-delay: 0.05s;
    background: radial-gradient(
      circle,
      rgba(230, 230, 230, 0.9) 0%,
      rgba(180, 180, 180, 0.45) 40%,
      transparent 70%
    );
  }

  .bird-roast-show {
    width: calc(${ROAST_DISPLAY_W}px * var(--bird-scale, 1));
    height: calc(${ROAST_DISPLAY_H}px * var(--bird-scale, 1));
    transform: none !important;
    filter: drop-shadow(2px 5px 4px rgba(0, 0, 0, 0.32));
  }

  .bird-roast-plate {
    display: block;
    width: 100%;
    height: 100%;
    max-width: none;
    object-fit: contain;
    pointer-events: none;
    user-select: none;
  }

  @keyframes bird-hit-smoke-puff {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.25);
    }
    25% {
      opacity: 0.9;
      transform: translate(-50%, -55%) scale(1.3);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -70%) scale(2.2);
    }
  }

  @keyframes bird-pigeon-drop-fall {
    0% {
      transform: translate3d(0, 0, 0);
    }
    100% {
      transform: translate3d(0, var(--bird-fall-px, 400px), 0);
    }
  }

  .bird-pigeon-drop-hit .bird-roast-show {
    animation: bird-roast-land-fade 0.55s ease-out calc(0.16s + var(--bird-fall-ms, 800ms) + 0.4s) forwards;
  }

  @keyframes bird-roast-land-fade {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  @keyframes bird-fly-across {
    from {
      transform: translate3d(calc(${BIRD_CROSS_START} * 100cqw), 0, 0);
    }
    to {
      transform: translate3d(calc(${BIRD_CROSS_END} * 100cqw), 0, 0);
    }
  }

  .bird-splat-root {
    position: absolute;
    left: 0;
    top: 0;
    pointer-events: none;
    z-index: 19;
    will-change: transform, opacity;
    transform: translate(var(--splat-x, 0px), var(--splat-y, 0px));
    animation: bird-splat-fade var(--splat-fade-ms, 700ms) ease-out forwards;
    animation-delay: var(--splat-hold-ms, 1700ms);
  }

  @keyframes bird-splat-fade {
    from {
      opacity: 1;
      transform: translate(var(--splat-x, 0px), var(--splat-y, 0px)) scale(1);
    }
    to {
      opacity: 0;
      transform: translate(var(--splat-x, 0px), var(--splat-y, 0px)) scale(0.92);
    }
  }

  .bird-poop-penalty-anchor {
    position: absolute;
    left: 0;
    top: 0;
    pointer-events: none;
    z-index: 22;
    will-change: transform;
  }

  .bird-poop-penalty-float {
    position: relative;
    display: block;
    font-family: "Courier New", Courier, monospace;
    font-size: 1.65rem;
    font-weight: 900;
    color: #fecaca;
    text-shadow: 0 0 14px rgba(239, 68, 68, 0.65);
    -webkit-text-stroke: 1.5px #991b1b;
    pointer-events: none;
    z-index: 22;
    white-space: nowrap;
  }
`;
