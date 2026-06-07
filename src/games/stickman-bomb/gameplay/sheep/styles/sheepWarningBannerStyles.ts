/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const sheepWarningBannerStyles = `
  .sheep-warning-banner {
    --stick: #1a1a1a;
    position: absolute;
    left: 50%;
    top: 36%;
    transform: translateX(-50%);
    pointer-events: none;
    filter: drop-shadow(2px 3px 0 rgba(0, 0, 0, 0.12));
  }

  .sheep-warning-banner-box {
    position: relative;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 22px 16px 16px;
    min-width: 240px;
  }

  .sheep-warning-banner-box::before {
    content: '';
    position: absolute;
    inset: 0;
    background: #fff;
    border: 4px solid var(--stick);
    border-radius: 48% 52% 50% 50% / 52% 48% 52% 48%;
    z-index: 0;
  }

  .sheep-warning-banner-box::after {
    content: '';
    position: absolute;
    inset: -3px 4px 3px -4px;
    border: 2px solid var(--stick);
    border-radius: 52% 48% 46% 54% / 48% 52% 48% 52%;
    opacity: 0.22;
    pointer-events: none;
    z-index: 0;
  }

  .sheep-warning-joint {
    position: absolute;
    width: 8px;
    height: 8px;
    background: #fff;
    border: 2.5px solid var(--stick);
    border-radius: 50%;
    z-index: 2;
  }

  .sheep-warning-joint-tl { top: 5px; left: 8px; }
  .sheep-warning-joint-tr { top: 7px; right: 10px; }
  .sheep-warning-joint-bl { bottom: 8px; left: 12px; }
  .sheep-warning-joint-br { bottom: 5px; right: 8px; }

  .sheep-warning-icon-wrap {
    position: relative;
    z-index: 1;
    flex-shrink: 0;
    width: 52px;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sheep-warning-icon-badge {
    position: absolute;
    top: -2px;
    right: -2px;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    border: 2.5px solid var(--stick);
    border-radius: 45% 55% 50% 50% / 50% 45% 55% 50%;
    font-family: ui-monospace, 'Courier New', monospace;
    font-size: 0.72rem;
    font-weight: 900;
    color: var(--stick);
    line-height: 1;
    transform: rotate(-8deg);
  }

  .sheep-warning-copy {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    color: var(--stick);
    font-family: ui-monospace, 'Courier New', monospace;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .sheep-warning-kicker {
    font-size: 0.62rem;
    font-weight: 700;
    opacity: 0.72;
    letter-spacing: 0.14em;
  }

  .sheep-warning-title {
    margin: 0;
    font-size: 0.92rem;
    font-weight: 900;
    line-height: 1.15;
    text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.06);
  }
`;
