/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const sheepHitBurstStyles = `
  .sheep-hit-burst-root {
    position: absolute;
    z-index: 30;
    pointer-events: none;
    transform: translate(-50%, -50%);
  }

  .sheep-hit-burst-ring {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 72px;
    height: 72px;
    margin: -36px 0 0 -36px;
    border-radius: 50%;
    border: 3px solid rgba(251, 191, 36, 0.95);
    box-shadow: 0 0 22px rgba(251, 191, 36, 0.65);
  }

  .sheep-hit-burst-flash {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 44px;
    height: 44px;
    margin: -22px 0 0 -22px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(254, 243, 199, 0.95) 0%, rgba(251, 191, 36, 0.35) 55%, transparent 72%);
  }

  .sheep-hit-burst-particle {
    position: absolute;
    left: 50%;
    top: 50%;
    margin: -0.55rem 0 0 -0.55rem;
    font-size: 1.1rem;
    line-height: 1;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25));
  }

  .sheep-hit-burst-label {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translateX(-50%);
    font-family: ui-monospace, 'Courier New', monospace;
    font-size: 1.35rem;
    font-weight: 900;
    color: #fef3c7;
    text-shadow: 0 0 12px rgba(251, 191, 36, 0.85), 0 2px 0 #92400e;
    white-space: nowrap;
  }
`;
