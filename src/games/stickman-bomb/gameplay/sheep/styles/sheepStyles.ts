/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SHEEP_CROSSING_MS, SHEEP_FLOCK_BOTTOM_PERCENT, SHEEP_FLOCK_TOP_PERCENT } from '../config/sheepConfig';

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
    top: ${SHEEP_FLOCK_TOP_PERCENT}%;
    right: 0;
    bottom: ${SHEEP_FLOCK_BOTTOM_PERCENT}%;
    left: 0;
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
    animation: sheep-cross-ltr var(--cross-ms, ${SHEEP_CROSSING_MS}ms) linear forwards;
    animation-delay: var(--cross-delay, 0ms);
  }

  .sheep-unit-cross-rtl {
    transform: translate3d(calc(1.18 * 100cqw), 0, 0);
    animation: sheep-cross-rtl var(--cross-ms, ${SHEEP_CROSSING_MS}ms) linear forwards;
    animation-delay: var(--cross-delay, 0ms);
  }

  .sheep-unit-body {
    position: relative;
    z-index: 1;
    display: block;
    animation: sheep-bobble-ltr var(--bob-ms, 520ms) ease-in-out infinite;
    transform: scaleX(-1);
    will-change: transform;
  }

  .sheep-unit-cross-rtl .sheep-unit-body {
    animation-name: sheep-bobble-rtl;
    transform: scaleX(1);
  }

  .sheep-unit-smoke-trail {
    position: absolute;
    bottom: -1px;
    width: var(--smoke-len, 4.2rem);
    height: 0.62rem;
    pointer-events: none;
    z-index: 0;
    overflow: visible;
  }

  .sheep-unit-cross:not(.sheep-unit-cross-rtl) .sheep-unit-smoke-trail {
    left: 58%;
    transform: translateX(-100%);
  }

  .sheep-unit-cross-rtl .sheep-unit-smoke-trail {
    left: 42%;
    transform: translateX(0);
  }

  .sheep-smoke-ground {
    position: absolute;
    inset: 0;
    border-radius: 999px;
    filter: blur(4px);
    will-change: transform, opacity;
    animation: sheep-smoke-ground var(--bob-ms, 520ms) ease-in-out infinite;
  }

  .sheep-unit-cross:not(.sheep-unit-cross-rtl) .sheep-smoke-ground {
    transform-origin: 100% 50%;
    background: linear-gradient(
      to left,
      transparent 0%,
      rgba(205, 205, 205, 0.14) 18%,
      rgba(235, 235, 235, 0.62) 48%,
      rgba(245, 245, 245, 0.82) 72%,
      rgba(225, 225, 225, 0.55) 88%,
      transparent 100%
    );
  }

  .sheep-unit-cross-rtl .sheep-smoke-ground {
    transform-origin: 0% 50%;
    background: linear-gradient(
      to right,
      transparent 0%,
      rgba(205, 205, 205, 0.14) 18%,
      rgba(235, 235, 235, 0.62) 48%,
      rgba(245, 245, 245, 0.82) 72%,
      rgba(225, 225, 225, 0.55) 88%,
      transparent 100%
    );
  }

  .sheep-unit-rear .sheep-unit-smoke-trail {
    height: 0.48rem;
    opacity: 0.72;
  }

  .sheep-unit-gold .sheep-smoke-ground {
    filter: blur(4px) saturate(1.2);
  }

  .sheep-unit-gold.sheep-unit-cross:not(.sheep-unit-cross-rtl) .sheep-smoke-ground {
    background: linear-gradient(
      to left,
      transparent 0%,
      rgba(234, 179, 8, 0.12) 18%,
      rgba(254, 240, 138, 0.55) 48%,
      rgba(253, 224, 71, 0.78) 72%,
      rgba(234, 179, 8, 0.45) 88%,
      transparent 100%
    );
  }

  .sheep-unit-gold.sheep-unit-cross-rtl .sheep-smoke-ground {
    background: linear-gradient(
      to right,
      transparent 0%,
      rgba(234, 179, 8, 0.12) 18%,
      rgba(254, 240, 138, 0.55) 48%,
      rgba(253, 224, 71, 0.78) 72%,
      rgba(234, 179, 8, 0.45) 88%,
      transparent 100%
    );
  }

  .sheep-unit-pink.sheep-unit-cross:not(.sheep-unit-cross-rtl) .sheep-smoke-ground {
    background: linear-gradient(
      to left,
      transparent 0%,
      rgba(236, 72, 153, 0.12) 18%,
      rgba(251, 207, 232, 0.55) 48%,
      rgba(244, 114, 182, 0.76) 72%,
      rgba(236, 72, 153, 0.42) 88%,
      transparent 100%
    );
  }

  .sheep-unit-pink.sheep-unit-cross-rtl .sheep-smoke-ground {
    background: linear-gradient(
      to right,
      transparent 0%,
      rgba(236, 72, 153, 0.12) 18%,
      rgba(251, 207, 232, 0.55) 48%,
      rgba(244, 114, 182, 0.76) 72%,
      rgba(236, 72, 153, 0.42) 88%,
      transparent 100%
    );
  }

  .sheep-unit-black.sheep-unit-cross:not(.sheep-unit-cross-rtl) .sheep-smoke-ground {
    background: linear-gradient(
      to left,
      transparent 0%,
      rgba(51, 65, 85, 0.16) 18%,
      rgba(100, 116, 139, 0.52) 48%,
      rgba(71, 85, 105, 0.72) 72%,
      rgba(51, 65, 85, 0.42) 88%,
      transparent 100%
    );
  }

  .sheep-unit-black.sheep-unit-cross-rtl .sheep-smoke-ground {
    background: linear-gradient(
      to right,
      transparent 0%,
      rgba(51, 65, 85, 0.16) 18%,
      rgba(100, 116, 139, 0.52) 48%,
      rgba(71, 85, 105, 0.72) 72%,
      rgba(51, 65, 85, 0.42) 88%,
      transparent 100%
    );
  }

  .sheep-unit-hit .sheep-unit-smoke-trail {
    display: none;
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
    z-index: 0;
  }

  .sheep-unit-rear {
    opacity: 0.9;
    filter: drop-shadow(1px 3px 2px rgba(0, 0, 0, 0.24));
  }

  .sheep-unit-gold .sheep-unit-body {
    filter: sepia(1) saturate(5) hue-rotate(8deg) brightness(1.08);
  }

  .sheep-unit-gold .sheep-unit-shadow {
    background: rgba(234, 179, 8, 0.32);
  }

  .sheep-unit-gold::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 8%;
    width: 42%;
    height: 42%;
    margin-left: -21%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(253, 224, 71, 0.5) 0%, transparent 72%);
    pointer-events: none;
  }

  .sheep-unit-pink .sheep-unit-body {
    filter: sepia(0.35) saturate(4) hue-rotate(280deg) brightness(1.05);
  }

  .sheep-unit-pink .sheep-unit-shadow {
    background: rgba(236, 72, 153, 0.3);
  }

  .sheep-unit-pink::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 8%;
    width: 42%;
    height: 42%;
    margin-left: -21%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(244, 114, 182, 0.48) 0%, transparent 72%);
    pointer-events: none;
  }

  .sheep-unit-black .sheep-unit-body {
    filter: grayscale(1) brightness(0.32) contrast(1.25);
  }

  .sheep-unit-black .sheep-unit-shadow {
    background: rgba(15, 23, 42, 0.42);
  }

  .sheep-unit-black::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 8%;
    width: 42%;
    height: 42%;
    margin-left: -21%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(30, 41, 59, 0.55) 0%, transparent 72%);
    pointer-events: none;
  }

  .sheep-unit-hit.sheep-unit-cross {
    animation-play-state: paused;
  }

  @keyframes sheep-cross-ltr {
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

  @keyframes sheep-cross-rtl {
    0% {
      transform: translate3d(calc(1.18 * 100cqw), 0, 0);
    }
    8% {
      transform: translate3d(calc(1.08 * 100cqw), -2px, 0);
    }
    100% {
      transform: translate3d(calc(-0.18 * 100cqw), 0, 0);
    }
  }

  @keyframes sheep-bobble-ltr {
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

  @keyframes sheep-bobble-rtl {
    0%, 100% {
      transform: scaleX(1) translateY(0) rotate(0deg);
    }
    25% {
      transform: scaleX(1) translateY(-3px) rotate(3deg);
    }
    50% {
      transform: scaleX(1) translateY(-5px) rotate(0deg);
    }
    75% {
      transform: scaleX(1) translateY(-2px) rotate(-3deg);
    }
  }

  @keyframes sheep-smoke-ground {
    0%, 100% {
      opacity: 0.55;
      transform: scaleX(0.82) scaleY(0.9);
    }
    50% {
      opacity: 0.92;
      transform: scaleX(1.08) scaleY(1);
    }
  }

  .sheep-unit-hit .sheep-unit-body {
    animation: sheep-hit-pop-ltr 0.34s ease-out forwards;
  }

  .sheep-unit-cross-rtl.sheep-unit-hit .sheep-unit-body {
    animation-name: sheep-hit-pop-rtl;
  }

  .sheep-unit-hit .sheep-unit-shadow {
    animation: sheep-shadow-vanish 0.28s ease-out forwards;
  }

  @keyframes sheep-hit-pop-ltr {
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

  @keyframes sheep-hit-pop-rtl {
    0% {
      transform: scaleX(1) scale(1) rotate(0deg);
      opacity: 1;
      filter: brightness(1);
    }
    35% {
      transform: scaleX(1) scale(1.35) rotate(-12deg) translateY(-10px);
      opacity: 1;
      filter: brightness(1.45);
    }
    100% {
      transform: scaleX(1) scale(0.2) rotate(28deg) translateY(-28px);
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
