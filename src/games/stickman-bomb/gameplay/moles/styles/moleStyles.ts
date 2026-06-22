/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  MOLE_SPRITE_DISPLAY_H,
  MOLE_SPRITE_DISPLAY_W,
} from '../config/moleSpriteConfig';

export const moleStyles = `
  .mole-field-layer {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .mole-hole {
    position: absolute;
    transform: translate(-50%, -50%);
    width: calc(${MOLE_SPRITE_DISPLAY_W}px * var(--mole-scale, 1));
    height: calc(${MOLE_SPRITE_DISPLAY_H}px * var(--mole-scale, 1));
    z-index: calc(12 + var(--mole-depth, 0));
  }

  .mole-hole-shadow {
    position: absolute;
    left: 50%;
    bottom: 2%;
    transform: translateX(-50%);
    width: 72%;
    height: 14%;
    border-radius: 999px;
    background: radial-gradient(ellipse, rgba(0, 0, 0, 0.38) 0%, transparent 72%);
    filter: blur(1px);
  }

  .mole-unit {
    position: absolute;
    inset: 0;
    transform-origin: center bottom;
    transition:
      transform 0.18s ease-in,
      opacity 0.18s ease-in;
  }

  .mole-unit-hit {
    transform: scale(0.72) rotate(-8deg);
    opacity: 0;
  }

  .mole-sprite-viewport {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
    filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.35));
    background-repeat: no-repeat;
  }

  .mole-control-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 4.5rem;
    min-width: 4.5rem;
    height: 2.35rem;
    overflow: hidden;
    border-radius: 0.375rem;
    border: 1px solid rgba(79, 70, 229, 0.25);
    background: rgba(238, 242, 255, 0.9);
  }

  .mole-control-preview .mole-hole {
    position: relative;
    left: auto;
    top: auto;
    transform: none;
    --mole-scale: 0.46;
  }
`;
