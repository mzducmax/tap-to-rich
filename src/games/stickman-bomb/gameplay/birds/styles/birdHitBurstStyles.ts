/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const birdHitBurstStyles = `
  .bird-hit-burst-root {
    position: absolute;
    z-index: 30;
    pointer-events: none;
    transform: translate(-50%, -50%);
  }

  .bird-hit-burst-smoke-core {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 52px;
    height: 52px;
    margin: -26px 0 0 -26px;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(250, 250, 250, 0.95) 0%,
      rgba(210, 210, 210, 0.6) 38%,
      rgba(170, 170, 170, 0.25) 62%,
      transparent 78%
    );
    filter: blur(1px);
  }

  .bird-hit-burst-smoke-puff {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 34px;
    height: 34px;
    margin: -17px 0 0 -17px;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(240, 240, 240, 0.9) 0%,
      rgba(195, 195, 195, 0.5) 42%,
      rgba(155, 155, 155, 0.15) 68%,
      transparent 80%
    );
    filter: blur(1.5px);
  }

  .bird-hit-burst-label {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translateX(-50%);
    font-family: ui-monospace, 'Courier New', monospace;
    font-size: 1.25rem;
    font-weight: 900;
    color: #e0f2fe;
    text-shadow: 0 0 12px rgba(125, 211, 252, 0.85), 0 2px 0 #0c4a6e;
    white-space: nowrap;
  }
`;
