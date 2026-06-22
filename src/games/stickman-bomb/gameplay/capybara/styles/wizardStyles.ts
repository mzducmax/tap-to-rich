/**
 * Capybara wizard — spell-cast loop on the gameplay layer.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import {
  WIZARD_SHEET_DISPLAY_H,
  WIZARD_SHEET_DISPLAY_W,
  WIZARD_SPRITE_DISPLAY_H,
  WIZARD_SPRITE_DISPLAY_W,
} from '../config/wizardSpriteConfig';

/** Vertical lane — slightly above the capybara walker. */
export const WIZARD_BOTTOM = 'clamp(148px, 30vh, 38%)';

export const wizardStyles = `
  .wizard-layer {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 19;
    container-type: inline-size;
    contain: layout style;
  }

  .wizard-anchor {
    position: absolute;
    right: clamp(8%, 12cqw, 18%);
    bottom: ${WIZARD_BOTTOM};
    transform: translate3d(0, 0, 0);
    will-change: transform;
    animation: wizard-float 4.5s ease-in-out infinite;
  }

  .wizard-body {
    display: block;
    transform-origin: center bottom;
    /* Art faces right — mirror so wizard on the right looks toward the island. */
    transform: translate(50%, 0) scaleX(-1);
    filter: drop-shadow(0 0 12px rgba(80, 180, 255, 0.45))
      drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.35));
  }

  .wizard-sprite-viewport {
    width: ${WIZARD_SPRITE_DISPLAY_W}px;
    height: ${WIZARD_SPRITE_DISPLAY_H}px;
    overflow: hidden;
    position: relative;
  }

  .wizard-sprite-sheet {
    position: absolute;
    left: 0;
    top: 0;
    width: ${WIZARD_SHEET_DISPLAY_W}px;
    height: ${WIZARD_SHEET_DISPLAY_H}px;
    max-width: none;
    pointer-events: none;
    user-select: none;
    will-change: transform;
    image-rendering: auto;
  }

  @keyframes wizard-float {
    0%, 100% {
      transform: translate3d(0, 0, 0);
    }
    50% {
      transform: translate3d(0, -6px, 0);
    }
  }
`;
