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
    background: #000;
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
    animation: hacker-effect-flash 0.11s steps(1, end) infinite;
  }

  @keyframes hacker-effect-flash {
    0%, 45% {
      background: rgba(0, 255, 65, 0.22);
      box-shadow: inset 0 0 120px rgba(0, 255, 65, 0.35);
    }
    46%, 100% {
      background: rgba(0, 0, 0, 0.72);
      box-shadow: inset 0 0 80px rgba(0, 255, 65, 0.08);
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
    animation-duration: 0.18s;
    opacity: 0.55;
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
