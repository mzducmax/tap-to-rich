/**
 * Score display — docked left (gameplay target is the centered estate).
 * @license SPDX-License-Identifier: Apache-2.0
 */

export const scoreDisplaySceneStyles = `
  .score-display-root {
    position: absolute;
    left: clamp(48px, 10vw, 140px);
    top: 50%;
    transform: translateY(-50%);
    z-index: 2;
    pointer-events: none;
  }

  @media (max-width: 520px) {
    .score-display-root {
      left: clamp(28px, 7vw, 64px);
    }
  }
`;
