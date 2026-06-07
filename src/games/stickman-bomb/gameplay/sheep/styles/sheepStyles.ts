/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SHEEP_CROSSING_MS } from '../config/sheepConfig';

export const sheepStyles = `
  .sheep-herd-layer {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 25;
    container-type: inline-size;
    contain: layout paint style;
  }

  .sheep-flock {
    position: absolute;
    inset: 0;
  }

  .sheep-unit {
    position: absolute;
    left: 0;
    line-height: 1;
    transform-origin: center bottom;
    filter: drop-shadow(2px 4px 3px rgba(0, 0, 0, 0.32));
    will-change: transform, opacity;
  }

  .sheep-unit-cross {
    transform: translate3d(calc(-0.18 * 100cqw), 0, 0);
    animation: sheep-cross-real var(--cross-ms, ${SHEEP_CROSSING_MS}ms) linear forwards;
    animation-delay: var(--cross-delay, 0ms);
  }

  .sheep-unit-body {
    display: block;
    animation: sheep-bobble var(--bob-ms, 520ms) ease-in-out infinite;
    transform: scaleX(-1);
    will-change: transform;
  }

  .sheep-unit-shadow {
    position: absolute;
    left: 50%;
    bottom: -4px;
    width: 70%;
    height: 8px;
    margin-left: -35%;
    background: rgba(0, 0, 0, 0.18);
    border-radius: 50%;
    filter: blur(2px);
    transform: scaleX(var(--shadow-scale, 1));
  }

  .sheep-unit-hit.sheep-unit-cross {
    animation-play-state: paused;
  }

  @keyframes sheep-cross-real {
    0% {
      transform: translate3d(calc(-0.18 * 100cqw), 0, 0);
    }
    8% {
      transform: translate3d(calc(-0.08 * 100cqw), -2px, 0);
    }
    100% {
      transform: translate3d(calc(1.18 * 100cqw), 0, 0);
    }
  }

  @keyframes sheep-bobble {
    0%, 100% {
      transform: scaleX(-1) translateY(0) rotate(0deg);
    }
    25% {
      transform: scaleX(-1) translateY(-3px) rotate(-3deg);
    }
    50% {
      transform: scaleX(-1) translateY(-5px) rotate(0deg);
    }
    75% {
      transform: scaleX(-1) translateY(-2px) rotate(3deg);
    }
  }

  .sheep-unit-hit .sheep-unit-body {
    animation: sheep-hit-pop 0.34s ease-out forwards;
  }

  .sheep-unit-hit .sheep-unit-shadow {
    animation: sheep-shadow-vanish 0.28s ease-out forwards;
  }

  @keyframes sheep-hit-pop {
    0% {
      transform: scaleX(-1) scale(1) rotate(0deg);
      opacity: 1;
      filter: brightness(1);
    }
    35% {
      transform: scaleX(-1) scale(1.35) rotate(12deg) translateY(-10px);
      opacity: 1;
      filter: brightness(1.45);
    }
    100% {
      transform: scaleX(-1) scale(0.2) rotate(-28deg) translateY(-28px);
      opacity: 0;
      filter: brightness(1.8);
    }
  }

  @keyframes sheep-shadow-vanish {
    to {
      opacity: 0;
      transform: scaleX(var(--shadow-scale, 1)) scale(1.6);
    }
  }
`;
