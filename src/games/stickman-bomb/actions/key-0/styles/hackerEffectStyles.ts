/**
 * Hacker overlay styles (key 0).
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const hackerEffectStyles = `
  .hacker-effect-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    /* Transparent so the matrix rain runs over the live game. */
    background: rgba(0, 8, 0, 0.18);
    isolation: isolate;
    z-index: 70;
    opacity: 0;
  }

  .hacker-effect-layer--entering {
    animation: hacker-layer-enter-glitch 0.52s steps(8, end);
  }

  .hacker-effect-layer--exiting {
    animation: hacker-layer-exit-glitch 0.56s steps(6, end);
  }

  @keyframes hacker-layer-enter-glitch {
    0% {
      box-shadow: inset 0 0 0 rgba(0, 255, 65, 0);
    }
    12% {
      box-shadow: inset 0 0 140px rgba(0, 255, 65, 0.55);
    }
    24% {
      box-shadow: inset 0 0 40px rgba(0, 255, 65, 0.15);
    }
    36% {
      box-shadow: inset 0 0 100px rgba(0, 255, 65, 0.42);
    }
    100% {
      box-shadow: inset 0 0 60px rgba(0, 255, 65, 0.12);
    }
  }

  @keyframes hacker-layer-exit-glitch {
    0% {
      box-shadow: inset 0 0 60px rgba(0, 255, 65, 0.12);
    }
    18% {
      box-shadow: inset 0 0 120px rgba(0, 255, 65, 0.38);
    }
    42% {
      box-shadow: inset 0 0 24px rgba(0, 255, 65, 0.06);
    }
    100% {
      box-shadow: inset 0 0 0 rgba(0, 255, 65, 0);
    }
  }

  .hacker-effect-layer--entering .hacker-effect-scanlines {
    animation: hacker-scanlines-reveal 0.52s ease-out forwards;
  }

  .hacker-effect-layer--exiting .hacker-effect-scanlines {
    animation: hacker-scanlines-hide 0.56s ease-in forwards;
  }

  @keyframes hacker-scanlines-reveal {
    from { opacity: 0; }
    to { opacity: 0.18; }
  }

  @keyframes hacker-scanlines-hide {
    from { opacity: 0.18; }
    to { opacity: 0; }
  }

  .hacker-effect-layer--entering .hacker-effect-flash {
    animation: hacker-enter-flash 0.52s steps(4, end);
  }

  .hacker-effect-layer--exiting .hacker-effect-flash {
    animation: hacker-exit-flash 0.56s steps(3, end);
  }

  @keyframes hacker-enter-flash {
    0%, 100% {
      background: rgba(0, 255, 65, 0.35);
      opacity: 1;
    }
    50% {
      background: rgba(0, 0, 0, 0.55);
      opacity: 0.7;
    }
  }

  @keyframes hacker-exit-flash {
    0% {
      background: rgba(0, 0, 0, 0.45);
      opacity: 0.5;
    }
    100% {
      background: rgba(0, 255, 65, 0.18);
      opacity: 0;
    }
  }

  .hacker-effect-fx-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .hacker-effect-flash {
    position: absolute;
    inset: 0;
    pointer-events: none;
    mix-blend-mode: screen;
    animation: hacker-effect-flash 0.16s steps(1, end) infinite;
  }

  @keyframes hacker-effect-flash {
    0%, 45% {
      background: rgba(0, 255, 65, 0.06);
      box-shadow: inset 0 0 90px rgba(0, 255, 65, 0.12);
    }
    46%, 100% {
      background: transparent;
      box-shadow: inset 0 0 50px rgba(0, 255, 65, 0.04);
    }
  }

  .hacker-effect-scanlines {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.18;
    background: repeating-linear-gradient(
      to bottom,
      rgba(0, 255, 65, 0.08) 0px,
      rgba(0, 255, 65, 0.08) 1px,
      transparent 1px,
      transparent 3px
    );
  }

  .hacker-effect-alert {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    visibility: hidden;
    opacity: 0;
    pointer-events: none;
  }

  .hacker-effect-alert--visible {
    visibility: visible;
    opacity: 1;
    pointer-events: auto;
  }

  .hacker-effect-alert__image {
    width: min(52vw, 320px);
    height: auto;
    object-fit: contain;
    filter: drop-shadow(0 0 28px rgba(0, 255, 65, 0.75))
      drop-shadow(0 0 8px rgba(0, 255, 65, 0.45));
  }

  .hacker-effect-alert__title {
    margin: 0;
    padding: 0.55rem 1.25rem;
    border: 2px solid #00ff41;
    background: rgba(0, 0, 0, 0.82);
    color: #00ff41;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: clamp(1.1rem, 3.2vw, 1.75rem);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-shadow: 0 0 16px rgba(0, 255, 65, 0.85);
    box-shadow: 0 0 24px rgba(0, 255, 65, 0.35);
    transform-origin: center center;
  }

  .hacker-effect-alert--visible .hacker-effect-alert__title {
    animation: hacker-alert-title-pulse 0.95s ease-in-out infinite;
  }

  @keyframes hacker-alert-title-pulse {
    0%, 100% {
      transform: scale(0.9);
      box-shadow: 0 0 18px rgba(0, 255, 65, 0.3);
      text-shadow: 0 0 12px rgba(0, 255, 65, 0.7);
    }
    50% {
      transform: scale(1.16);
      box-shadow: 0 0 40px rgba(0, 255, 65, 0.65);
      text-shadow: 0 0 28px rgba(0, 255, 65, 1);
    }
  }

  .hacker-effect-layer--draining .hacker-effect-flash {
    animation-duration: 0.09s;
    opacity: 0.85;
  }

  /* ============ MADNESS — chaos while draining ============ */

  .hacker-effect-layer--draining {
    animation: hacker-madness-shake 0.09s steps(2, end) infinite;
  }

  @keyframes hacker-madness-shake {
    0%   { transform: translate(0, 0) skewX(0deg); }
    20%  { transform: translate(-6px, 3px) skewX(0.8deg); }
    40%  { transform: translate(5px, -4px) skewX(-1.2deg); }
    60%  { transform: translate(-4px, -3px) skewX(0.6deg); }
    80%  { transform: translate(6px, 4px) skewX(-0.8deg); }
    100% { transform: translate(0, 0) skewX(0deg); }
  }

  .hacker-effect-layer--draining .hacker-effect-scanlines {
    animation: hacker-madness-scanjump 0.22s steps(3, end) infinite;
    opacity: 0.32;
  }

  @keyframes hacker-madness-scanjump {
    0%   { transform: translateY(0); }
    33%  { transform: translateY(-7px); }
    66%  { transform: translateY(5px); }
    100% { transform: translateY(0); }
  }

  /* Random RGB-split glitch slices over the whole layer. */
  .hacker-effect-glitch {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0;
    mix-blend-mode: screen;
    background:
      repeating-linear-gradient(
        to bottom,
        rgba(255, 0, 60, 0.10) 0px,
        rgba(255, 0, 60, 0.10) 2px,
        transparent 2px,
        transparent 6px
      ),
      repeating-linear-gradient(
        to bottom,
        rgba(0, 200, 255, 0.10) 0px,
        rgba(0, 200, 255, 0.10) 3px,
        transparent 3px,
        transparent 9px
      );
  }

  .hacker-effect-layer--draining .hacker-effect-glitch {
    animation: hacker-madness-glitch 0.5s steps(1, end) infinite;
  }

  @keyframes hacker-madness-glitch {
    0%, 12%   { opacity: 0; transform: translateX(0) scaleY(1); }
    14%       { opacity: 0.9; transform: translateX(-14px) scaleY(1.04); clip-path: inset(20% 0 55% 0); }
    18%       { opacity: 0.7; transform: translateX(12px) scaleY(0.96); clip-path: inset(60% 0 12% 0); }
    22%, 60%  { opacity: 0; transform: translateX(0) scaleY(1); }
    63%       { opacity: 0.85; transform: translateX(10px); clip-path: inset(40% 0 35% 0); }
    68%       { opacity: 0; transform: translateX(0); }
  }

  /* Alert image + title go berserk while draining. */
  .hacker-effect-layer--draining .hacker-effect-alert__image {
    animation: hacker-madness-img 0.16s steps(2, end) infinite;
  }

  @keyframes hacker-madness-img {
    0%   { transform: translate(0, 0) scale(1); filter: drop-shadow(0 0 28px rgba(0, 255, 65, 0.75)) hue-rotate(0deg); }
    25%  { transform: translate(-7px, 2px) scale(1.05); filter: drop-shadow(-6px 0 0 rgba(255, 0, 60, 0.8)) drop-shadow(6px 0 0 rgba(0, 200, 255, 0.8)) hue-rotate(40deg); }
    50%  { transform: translate(6px, -3px) scale(0.97); filter: drop-shadow(5px 0 0 rgba(255, 0, 60, 0.8)) drop-shadow(-5px 0 0 rgba(0, 200, 255, 0.8)) hue-rotate(-30deg); }
    75%  { transform: translate(-4px, 4px) scale(1.08); filter: drop-shadow(0 0 36px rgba(0, 255, 65, 1)) hue-rotate(20deg); }
    100% { transform: translate(0, 0) scale(1); filter: drop-shadow(0 0 28px rgba(0, 255, 65, 0.75)) hue-rotate(0deg); }
  }

  .hacker-effect-layer--draining .hacker-effect-alert__title {
    animation: hacker-madness-title 0.12s steps(2, end) infinite !important;
  }

  @keyframes hacker-madness-title {
    0%   { transform: translate(0, 0) scale(1.05); text-shadow: 0 0 16px rgba(0, 255, 65, 0.85); color: #00ff41; }
    25%  { transform: translate(4px, -2px) scale(1.18); text-shadow: -3px 0 0 rgba(255, 0, 60, 0.9), 3px 0 0 rgba(0, 200, 255, 0.9), 0 0 30px rgba(0, 255, 65, 1); color: #aaffcc; }
    50%  { transform: translate(-5px, 2px) scale(0.96); text-shadow: 3px 0 0 rgba(255, 0, 60, 0.9), -3px 0 0 rgba(0, 200, 255, 0.9); color: #ff3355; }
    75%  { transform: translate(3px, 3px) scale(1.22); text-shadow: 0 0 28px rgba(0, 255, 65, 1); color: #ffffff; }
    100% { transform: translate(0, 0) scale(1.05); text-shadow: 0 0 16px rgba(0, 255, 65, 0.85); color: #00ff41; }
  }

  .hacker-estate-reveal {
    filter: saturate(1.2) drop-shadow(0 0 24px rgba(0, 255, 65, 0.55));
    animation: hacker-estate-pulse 0.85s ease-in-out infinite;
  }

  @keyframes hacker-estate-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
  }

  .hacker-counter-hacked {
    filter: saturate(1.35) drop-shadow(0 0 18px rgba(239, 68, 68, 0.85));
    animation: hacker-counter-shake 0.12s linear infinite;
  }

  .hacker-balance-dock-elevated {
    z-index: 85 !important;
    pointer-events: none;
  }

  .hacker-balance-panel-active {
    filter: drop-shadow(0 0 28px rgba(0, 255, 65, 0.45));
  }

  .hacker-balance-panel-active.hacker-counter-hacked {
    filter: saturate(1.35) drop-shadow(0 0 22px rgba(239, 68, 68, 0.9));
  }

  @keyframes hacker-counter-shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-2px); }
    75% { transform: translateX(2px); }
  }
`;
