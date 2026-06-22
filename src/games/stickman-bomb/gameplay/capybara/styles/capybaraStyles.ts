/**
 * Capybara walker — sprite sheet walk cycle across the gameplay layer.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import {
  CAPYBARA_SHEET_DISPLAY_H,
  CAPYBARA_SHEET_DISPLAY_W,
  CAPYBARA_SPRITE_DISPLAY_H,
  CAPYBARA_SPRITE_DISPLAY_W,
} from '../config/capybaraSpriteConfig';

export const CAPYBARA_CROSS_MS = 12_000;
/** Vertical lane — clears bottom HUD dock + island grass edge. */
export const CAPYBARA_WALK_BOTTOM = 'clamp(108px, 24vh, 30%)';

export const capybaraStyles = `
  .capybara-walker-layer {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 19;
    container-type: inline-size;
    contain: layout style;
  }

  .capybara-walker {
    position: absolute;
    left: 0;
    bottom: ${CAPYBARA_WALK_BOTTOM};
    width: 0;
    height: 0;
    will-change: transform;
    transform: translate3d(calc(1.12 * 100cqw), 0, 0);
    animation: capybara-walk-across var(--capybara-cross-ms, ${CAPYBARA_CROSS_MS}ms) linear infinite alternate;
  }

  .capybara-walker-body {
    display: block;
    transform-origin: center bottom;
    transform: translate(-50%, 0);
    filter: drop-shadow(2px 4px 4px rgba(0, 0, 0, 0.35));
  }

  /* Sprite faces left by default — mirror when walking right. */
  .capybara-walker-body-face-right {
    transform: translate(-50%, 0) scaleX(-1);
  }

  .capybara-walker-body-face-left {
    transform: translate(-50%, 0) scaleX(1);
  }

  .capybara-sprite-viewport {
    width: ${CAPYBARA_SPRITE_DISPLAY_W}px;
    height: ${CAPYBARA_SPRITE_DISPLAY_H}px;
    overflow: hidden;
    position: relative;
  }

  .capybara-sprite-sheet {
    position: absolute;
    left: 0;
    top: 0;
    width: ${CAPYBARA_SHEET_DISPLAY_W}px;
    height: ${CAPYBARA_SHEET_DISPLAY_H}px;
    max-width: none;
    pointer-events: none;
    user-select: none;
    will-change: transform;
    image-rendering: auto;
  }

  @keyframes capybara-walk-across {
    0% {
      transform: translate3d(calc(1.12 * 100cqw), 0, 0);
    }
    100% {
      transform: translate3d(calc(-0.12 * 100cqw), 0, 0);
    }
  }
`;
