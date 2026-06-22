/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const gamePausedStyles = `
  .game-paused,
  .game-paused * {
    animation-play-state: paused !important;
  }

  /* Key [0] — enter/exit glitch + flash must keep running while game is paused. */
  .game-paused .hacker-effect-layer,
  .game-paused .hacker-effect-layer * {
    animation-play-state: running !important;
  }
`;
