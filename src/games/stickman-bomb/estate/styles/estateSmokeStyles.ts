/**
 * Smoke puff styles — sized to the estate footprint.
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const estateSmokeStyles = `
  .estate-smoke-root {
    position: absolute;
    left: 50%;
    bottom: 20%;
    width: 0;
    height: 0;
    z-index: 20;
    pointer-events: none;
    overflow: visible;
  }

  .estate-smoke-core {
    position: absolute;
    left: -88px;
    top: -88px;
    width: 176px;
    height: 176px;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(240, 240, 240, 0.92) 0%,
      rgba(190, 190, 190, 0.55) 42%,
      rgba(150, 150, 150, 0) 72%
    );
    filter: blur(8px);
  }

  .estate-smoke-puff {
    position: absolute;
    width: 72px;
    height: 72px;
    margin-left: -36px;
    margin-top: -36px;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(245, 245, 245, 0.9) 0%,
      rgba(200, 200, 200, 0.5) 52%,
      rgba(150, 150, 150, 0) 76%
    );
    filter: blur(7px);
  }
`;
