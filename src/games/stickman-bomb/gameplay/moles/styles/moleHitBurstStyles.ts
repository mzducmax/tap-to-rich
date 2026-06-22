/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MOLE_SCORE_FLOAT_THEME } from '../config/moleScoreFloatTheme';

export const moleHitBurstStyles = `
  .mole-hit-burst-root {
    position: absolute;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 80;
    width: 0;
    height: 0;
  }

  .mole-hit-burst-ring {
    position: absolute;
    left: 0;
    top: 0;
    transform: translate(-50%, -50%);
    width: 3.6rem;
    height: 3.6rem;
    border-radius: 999px;
    border: 3px solid rgba(244, 114, 182, 0.75);
    box-shadow: 0 0 16px rgba(244, 114, 182, 0.45);
  }

  .mole-hit-burst-flash {
    position: absolute;
    left: 0;
    top: 0;
    transform: translate(-50%, -50%);
    width: 2.4rem;
    height: 2.4rem;
    border-radius: 999px;
    background: radial-gradient(circle, rgba(243, 244, 246, 0.92) 0%, transparent 72%);
  }

  .mole-hit-burst-particle {
    position: absolute;
    left: 0;
    top: 0;
    font-size: 1.2rem;
    line-height: 1;
    transform: translate(-50%, -50%);
  }

  .mole-hit-burst-label {
    position: absolute;
    left: 0;
    top: 0;
    transform: translate(-50%, -50%);
    font-size: 1.55rem;
    font-weight: 900;
    color: ${MOLE_SCORE_FLOAT_THEME.color};
    font-family: ${MOLE_SCORE_FLOAT_THEME.fontFamily};
    text-shadow: ${MOLE_SCORE_FLOAT_THEME.shadow};
    -webkit-text-stroke: 1.5px ${MOLE_SCORE_FLOAT_THEME.stroke};
    paint-order: stroke fill;
    white-space: nowrap;
  }
`;
