/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SHEEP_SCORE_FLOAT_THEMES } from '../config/sheepScoreFloatTheme';

const labelBase = `
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-family: "Arial Rounded MT Bold", "Nunito", "Trebuchet MS", sans-serif;
  font-weight: 900;
  letter-spacing: 0.02em;
  white-space: nowrap;
  padding: 0.14rem 0.62rem;
  border-radius: 999px;
  paint-order: stroke fill;
  -webkit-text-stroke-width: 1.75px;
  line-height: 1.1;
  z-index: 2;
`;

function labelCss(variant: keyof typeof SHEEP_SCORE_FLOAT_THEMES, selector: string) {
  const theme = SHEEP_SCORE_FLOAT_THEMES[variant];
  return `
  ${selector} {
    ${labelBase}
    font-size: ${theme.fontSize};
    color: ${theme.color};
    -webkit-text-stroke-color: ${theme.stroke};
    text-shadow: ${theme.shadow};
    background: ${theme.bg};
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.28);
  }`;
}

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

  ${labelCss('white', '.sheep-hit-burst-label')}

  .sheep-hit-burst-root-gold .sheep-hit-burst-ring {
    border-color: rgba(250, 204, 21, 0.95);
    box-shadow: 0 0 24px rgba(234, 179, 8, 0.75);
  }

  .sheep-hit-burst-root-gold .sheep-hit-burst-flash {
    background: radial-gradient(circle, rgba(254, 240, 138, 0.95) 0%, rgba(234, 179, 8, 0.4) 55%, transparent 72%);
  }

  ${labelCss('gold', '.sheep-hit-burst-root-gold .sheep-hit-burst-label')}

  .sheep-hit-burst-root-pink .sheep-hit-burst-ring {
    border-color: rgba(244, 114, 182, 0.95);
    box-shadow: 0 0 22px rgba(236, 72, 153, 0.7);
  }

  .sheep-hit-burst-root-pink .sheep-hit-burst-flash {
    background: radial-gradient(circle, rgba(251, 207, 232, 0.95) 0%, rgba(236, 72, 153, 0.38) 55%, transparent 72%);
  }

  ${labelCss('pink', '.sheep-hit-burst-root-pink .sheep-hit-burst-label')}

  .sheep-hit-burst-root-penalty .sheep-hit-burst-ring {
    border-color: rgba(248, 113, 113, 0.95);
    box-shadow: 0 0 22px rgba(239, 68, 68, 0.65);
  }

  .sheep-hit-burst-root-penalty .sheep-hit-burst-flash {
    background: radial-gradient(circle, rgba(254, 202, 202, 0.95) 0%, rgba(239, 68, 68, 0.35) 55%, transparent 72%);
  }

  ${labelCss('black', '.sheep-hit-burst-root-penalty .sheep-hit-burst-label')}
`;
