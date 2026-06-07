/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const counterStylesStick = `
  .counter-scene {
    --stick: #1a1a1a;
    --ground-shadow: rgba(0, 0, 0, 0.15);
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    perspective: 1000px;
    padding: 48px;
    cursor: none;
  }

  .stick-ui-box {
    position: relative;
    z-index: 10;
    padding: 20px 32px 24px;
    filter: drop-shadow(2px 3px 0 rgba(0, 0, 0, 0.12));
  }

  /* Hand-drawn frame — white fill + curved border like stickman head */
  .stick-ui-box::before {
    content: '';
    position: absolute;
    inset: 0;
    background: #fff;
    border: 4px solid var(--stick);
    border-radius: 46% 54% 53% 47% / 50% 46% 54% 50%;
    z-index: 0;
  }

  /* Offset sketch stroke — doodle feel */
  .stick-ui-box::after {
    content: '';
    position: absolute;
    inset: -4px 3px 2px -3px;
    border: 2px solid var(--stick);
    border-radius: 54% 46% 47% 53% / 46% 54% 46% 54%;
    opacity: 0.22;
    pointer-events: none;
    z-index: 0;
  }

  /* Decorative stick joints at corners */
  .stick-joint {
    position: absolute;
    width: 9px;
    height: 9px;
    background: #fff;
    border: 2.5px solid var(--stick);
    border-radius: 50%;
    z-index: 2;
  }

  .stick-joint-tl { top: 6px; left: 10px; }
  .stick-joint-tr { top: 8px; right: 12px; }
  .stick-joint-bl { bottom: 10px; left: 14px; }
  .stick-joint-br { bottom: 6px; right: 10px; }

  .digit-wrapper {
    position: relative;
    z-index: 1;
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: center;
  }

  .digit-slot {
    position: relative;
    height: 84px;
    width: 52px;
    overflow: hidden;
  }

  .digit-group-gap {
    width: 20px;
    flex-shrink: 0;
  }

  .digit-strip {
    transition: transform 0.38s cubic-bezier(0.34, 1.2, 0.64, 1);
    will-change: transform;
  }

  .digit-cell {
    height: 84px;
    width: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    content-visibility: auto;
    contain-intrinsic-size: 52px 84px;
    contain: layout style paint;
  }

  .stick-digit-glyph {
    width: 52px;
    height: 84px;
    display: block;
    overflow: visible;
  }

  .stick-digit-glyph path {
    fill: none;
    stroke: var(--stick);
    stroke-width: 4.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .counter-dollar-stick {
    width: 40px;
    height: 84px;
    flex-shrink: 0;
    margin-left: 2px;
  }

  .counter-dollar-stick path {
    fill: none;
    stroke: var(--stick);
    stroke-width: 4.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .ground-shadow {
    position: absolute;
    bottom: 4px;
    width: 180px;
    height: 36px;
    background: var(--ground-shadow);
    border-radius: 50%;
    filter: blur(10px);
    transform: rotateX(60deg);
    z-index: 1;
  }

  .float-animation {
    animation: counterFloatMove 3s ease-in-out infinite;
  }

  .shadow-animation {
    animation: counterShadowScale 3s ease-in-out infinite;
  }

  @keyframes counterFloatMove {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-30px); }
  }

  @keyframes counterShadowScale {
    0%, 100% {
      transform: rotateX(60deg) scale(1);
      opacity: 1;
    }
    50% {
      transform: rotateX(60deg) scale(0.7);
      opacity: 0.4;
    }
  }
`;
