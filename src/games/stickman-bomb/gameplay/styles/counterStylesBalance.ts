/**
 * Minimal balance-style counter — digits only, no panel frame.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const counterStylesBalance = `
  .counter-scene-balance {
    --balance-text: #ffffff;
    --balance-glow: rgba(255, 255, 255, 0.35);
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    perspective: 1000px;
    padding: 32px 48px;
    cursor: none;
  }

  .balance-display {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 12px;
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.45));
  }

  .counter-scene-balance .digit-wrapper {
    display: flex;
    gap: 0;
    align-items: center;
  }

  .counter-scene-balance .digit-slot {
    height: 108px;
    width: 62px;
    overflow: hidden;
    border-right: none;
  }

  .counter-scene-balance .digit-group-gap {
    width: 24px;
    flex-shrink: 0;
  }

  .counter-scene-balance .digit-sign {
    height: 108px;
    width: 48px;
    flex-shrink: 0;
    font-size: 96px;
    font-weight: 700;
    font-family: ui-monospace, 'SF Mono', 'Cascadia Code', 'Courier New', monospace;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--balance-text);
    text-shadow:
      0 0 12px var(--balance-glow),
      0 2px 4px rgba(0, 0, 0, 0.55);
    line-height: 1;
  }

  .counter-scene-balance .digit-strip {
    transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .counter-scene-balance .digit {
    height: 108px;
    font-size: 96px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    font-family: ui-monospace, 'SF Mono', 'Cascadia Code', 'Courier New', monospace;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--balance-text);
    text-shadow:
      0 0 12px var(--balance-glow),
      0 2px 4px rgba(0, 0, 0, 0.55);
    letter-spacing: -0.04em;
  }

  .counter-scene-balance .counter-dollar-balance {
    height: 108px;
    font-size: 72px;
    font-weight: 700;
    font-family: ui-monospace, 'SF Mono', 'Cascadia Code', 'Courier New', monospace;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--balance-text);
    text-shadow:
      0 0 12px var(--balance-glow),
      0 2px 4px rgba(0, 0, 0, 0.55);
    line-height: 1;
    margin-left: 4px;
    flex-shrink: 0;
    opacity: 0.92;
  }

  .counter-scene-balance .float-animation {
    animation: counterFloatMove 3s ease-in-out infinite;
  }

  @keyframes counterFloatMove {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-30px); }
  }
`;
