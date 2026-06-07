/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const STICK = '#1a1a1a';

export const bowStickmanStyles = `
  .sb-bow-archer-root {
    position: relative;
    width: 112px;
    height: 118px;
    filter: drop-shadow(2px 3px 0 rgba(0, 0, 0, 0.12));
  }

  .sb-bow-archer-svg {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  .sb-bow-limb {
    stroke: ${STICK};
    stroke-width: 4;
    stroke-linecap: round;
    fill: none;
  }

  .sb-bow-torso-line {
    stroke-width: 4.5;
  }

  .sb-bow-foot {
    fill: ${STICK};
  }

  .sb-bow-hand-dot {
    fill: #fff;
    stroke: ${STICK};
    stroke-width: 2.5;
  }

  .sb-bow-head {
    fill: #fff;
    stroke: ${STICK};
    stroke-width: 4;
  }

  .sb-bow-eye {
    fill: ${STICK};
  }

  .sb-bow-curve {
    stroke: ${STICK};
    stroke-width: 4;
    stroke-linecap: round;
    fill: none;
  }

  .sb-bow-grip {
    stroke: ${STICK};
    stroke-width: 5;
    stroke-linecap: round;
  }

  .sb-bow-string {
    stroke: ${STICK};
    stroke-width: 1.6;
    fill: none;
    stroke-linejoin: round;
  }

  .sb-bow-draw,
  .sb-bow-string,
  .sb-bow-arrow-on-bow {
    display: none;
  }

  .sb-bow-arrow-shaft {
    stroke-width: 3;
  }

  .sb-bow-arrow-tip {
    fill: ${STICK};
  }

  /* --- STAND: light draw --- */
  .sb-bow-pose-stand .sb-bow-draw-stand,
  .sb-bow-pose-stand .sb-bow-string-stand,
  .sb-bow-pose-stand .sb-bow-arrow-stand {
    display: block;
  }

  /* --- AIM: full draw (reference image) --- */
  .sb-bow-pose-aim .sb-bow-draw-aim,
  .sb-bow-pose-aim .sb-bow-string-aim,
  .sb-bow-pose-aim .sb-bow-arrow-aim {
    display: block;
  }

  .sb-bow-pose-aim .sb-bow-back-forearm {
    transform-origin: 20px 34px;
    animation: sb-bow-draw-pulse 0.6s ease-in-out infinite alternate;
  }

  .sb-bow-pose-aim .sb-bow-string-hand {
    animation: sb-bow-hand-pulse 0.6s ease-in-out infinite alternate;
  }

  @keyframes sb-bow-draw-pulse {
    from { transform: rotate(0deg); }
    to { transform: rotate(-3deg); }
  }

  @keyframes sb-bow-hand-pulse {
    from { transform: translate(0, 0); }
    to { transform: translate(-2px, 0); }
  }

  /* --- RELEASE: string slack, arm follows through --- */
  .sb-bow-pose-release .sb-bow-draw-release,
  .sb-bow-pose-release .sb-bow-string-rest {
    display: block;
  }

  .sb-bow-pose-release .sb-bow-back-forearm-release {
    transform-origin: 20px 34px;
    animation: sb-bow-arm-release 0.3s ease-out forwards;
  }

  @keyframes sb-bow-arm-release {
    from { transform: rotate(0deg); }
    to { transform: rotate(16deg); }
  }

  /* Flying / stuck arrow (BowSequence) */
  .sb-arrow-projectile {
    position: absolute;
    width: 34px;
    height: 6px;
    transform-origin: left center;
    pointer-events: none;
    z-index: 26;
  }

  .sb-arrow-shaft {
    position: absolute;
    inset: 2px 8px 2px 0;
    background: ${STICK};
    border-radius: 2px;
  }

  .sb-arrow-head {
    position: absolute;
    right: 0;
    top: 50%;
    width: 0;
    height: 0;
    margin-top: -4px;
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    border-left: 9px solid ${STICK};
  }

  .sb-arrow-fletch {
    position: absolute;
    left: 0;
    top: 50%;
    width: 7px;
    height: 7px;
    margin-top: -3.5px;
    background: #fca5a5;
    clip-path: polygon(0 50%, 100% 0, 100% 100%);
  }

  .sb-arrow-stuck {
    z-index: 28;
    animation: sb-arrow-stick-wobble 0.35s ease-out forwards;
  }

  @keyframes sb-arrow-stick-wobble {
    0% { transform: rotate(var(--arrow-angle, 0rad)) scale(1.08); }
    40% { transform: rotate(var(--arrow-angle, 0rad)) scale(0.96); }
    100% { transform: rotate(var(--arrow-angle, 0rad)) scale(1); }
  }

  .sb-bow-archer-fade-out {
    animation: sb-bow-fade-out 0.45s ease-out forwards;
  }

  @keyframes sb-bow-fade-out {
    to { opacity: 0; }
  }
`;
