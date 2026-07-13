/**
 * Money spinner styles (key 5).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import {
  MONEY_SPINNER_FADE_MS,
  MONEY_SPINNER_INTRO_MS,
  MONEY_SPINNER_OVERLAY_Z,
  MONEY_SPINNER_WHEEL_SIZE,
} from '../config/moneySpinnerConfig';

export const moneySpinnerStyles = `
  .money-spinner-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: ${MONEY_SPINNER_OVERLAY_Z};
    contain: layout style;
    isolation: isolate;
  }

  .money-spinner-dim {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      ellipse 80% 70% at 50% 45%,
      rgba(6, 3, 16, 0.35) 0%,
      rgba(3, 1, 10, 0.6) 55%,
      rgba(0, 0, 0, 0.75) 100%
    );
    opacity: 0;
    animation: money-spinner-dim-in ${MONEY_SPINNER_INTRO_MS}ms ease-out forwards;
  }

  .money-spinner-stage {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .money-spinner-root {
    position: relative;
    width: ${MONEY_SPINNER_WHEEL_SIZE}px;
    height: ${MONEY_SPINNER_WHEEL_SIZE}px;
    animation: money-spinner-pop-in ${MONEY_SPINNER_INTRO_MS}ms cubic-bezier(0.2, 1.4, 0.4, 1) forwards;
    filter: drop-shadow(0 14px 34px rgba(0, 0, 0, 0.55));
  }

  .money-spinner-stage--closing .money-spinner-root {
    animation: money-spinner-pop-out ${MONEY_SPINNER_FADE_MS}ms ease-in forwards;
  }

  .money-spinner-stage--closing .money-spinner-dim {
    animation: money-spinner-dim-out ${MONEY_SPINNER_FADE_MS}ms ease-in forwards;
  }

  .money-spinner-rim {
    position: absolute;
    inset: -14px;
    border-radius: 50%;
    background:
      radial-gradient(circle at 30% 24%, #fff6cf 0%, #f7c948 22%, #b8860b 62%, #7a5504 100%);
    box-shadow:
      inset 0 0 0 3px rgba(255, 244, 200, 0.55),
      inset 0 -6px 14px rgba(70, 45, 0, 0.55),
      0 0 26px rgba(247, 201, 72, 0.35);
  }

  .money-spinner-rim-dot {
    position: absolute;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, #fffbe6 0%, #ffe27a 45%, #a87b00 100%);
    box-shadow: 0 0 6px rgba(255, 232, 150, 0.9);
    animation: money-spinner-bulb 900ms ease-in-out infinite;
  }

  .money-spinner-wheel {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    overflow: hidden;
    box-shadow:
      inset 0 0 0 2px rgba(255, 255, 255, 0.22),
      inset 0 0 42px rgba(0, 0, 0, 0.35);
    will-change: transform;
  }

  .money-spinner-label {
    position: absolute;
    left: 50%;
    top: 50%;
    transform-origin: 0 0;
    pointer-events: none;
  }

  .money-spinner-label-text {
    display: block;
    transform: translate(-50%, -50%);
    font-family: 'Arial Black', 'Segoe UI', sans-serif;
    font-size: 25px;
    font-weight: 900;
    letter-spacing: 0.02em;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.38);
    white-space: nowrap;
  }

  .money-spinner-hub {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 76px;
    height: 76px;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    background: radial-gradient(circle at 32% 26%, #fffdf4 0%, #ffe8a3 40%, #d4a017 100%);
    box-shadow:
      inset 0 -4px 10px rgba(105, 70, 0, 0.4),
      0 4px 14px rgba(0, 0, 0, 0.45);
  }

  .money-spinner-pointer {
    position: absolute;
    left: 50%;
    top: -30px;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 17px solid transparent;
    border-right: 17px solid transparent;
    border-top: 40px solid #ff3b30;
    filter: drop-shadow(0 3px 5px rgba(0, 0, 0, 0.5));
    z-index: 3;
  }

  .money-spinner-pointer::after {
    content: '';
    position: absolute;
    left: -8px;
    top: -44px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, #ffd2ce 0%, #ff3b30 55%, #a3140c 100%);
  }

  .money-spinner-win-flash {
    position: absolute;
    inset: -14px;
    border-radius: 50%;
    pointer-events: none;
    opacity: 0;
    box-shadow: 0 0 0 6px rgba(255, 226, 122, 0.9), 0 0 60px 18px rgba(255, 214, 90, 0.65);
    animation: money-spinner-win-flash 720ms ease-out forwards;
  }

  .money-spinner-win-flash--penalty {
    box-shadow: 0 0 0 6px rgba(255, 90, 90, 0.9), 0 0 60px 18px rgba(220, 40, 40, 0.65);
  }

  .money-spinner-win-banner {
    position: absolute;
    left: 50%;
    bottom: -74px;
    transform: translateX(-50%) scale(0.6);
    padding: 10px 26px;
    border-radius: 999px;
    font-family: 'Arial Black', 'Segoe UI', sans-serif;
    font-size: 30px;
    font-weight: 900;
    color: #2b1c00;
    background: linear-gradient(180deg, #ffe98f 0%, #ffc93c 55%, #eda912 100%);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.65);
    white-space: nowrap;
    animation: money-spinner-banner-pop 420ms cubic-bezier(0.2, 1.6, 0.4, 1) forwards;
  }

  .money-spinner-win-banner--penalty {
    color: #ffffff;
    background: linear-gradient(180deg, #ff7a70 0%, #ef4444 55%, #b81f1f 100%);
  }

  @keyframes money-spinner-pop-in {
    from { transform: scale(0.55); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  @keyframes money-spinner-pop-out {
    from { transform: scale(1); opacity: 1; }
    to { transform: scale(0.75); opacity: 0; }
  }

  @keyframes money-spinner-dim-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes money-spinner-dim-out {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  @keyframes money-spinner-bulb {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.35; }
  }

  @keyframes money-spinner-win-flash {
    0% { opacity: 0; }
    18% { opacity: 1; }
    100% { opacity: 0; }
  }

  @keyframes money-spinner-banner-pop {
    from { transform: translateX(-50%) scale(0.6); opacity: 0; }
    to { transform: translateX(-50%) scale(1); opacity: 1; }
  }
`;
