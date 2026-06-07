/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const STICK = '#1a1a1a';

export const stickmanStyles = `
  .sb-stickman-root {
    position: relative;
    width: 72px;
    height: 118px;
    filter: drop-shadow(2px 3px 0 rgba(0, 0, 0, 0.12));
  }

  .sb-humanoid {
    position: relative;
    width: 100%;
    height: 100%;
    transform-origin: 50% 85%;
  }

  /* Head — hand-drawn stroke matching the counter frame */
  .sb-head {
    position: absolute;
    top: 0;
    left: 50%;
    width: 34px;
    height: 34px;
    margin-left: -17px;
    border: 4px solid ${STICK};
    border-radius: 45% 55% 52% 48% / 48% 45% 55% 52%;
    background: #fff;
    z-index: 5;
  }

  .sb-face {
    position: absolute;
    inset: 0;
  }

  .sb-eye {
    position: absolute;
    top: 11px;
    width: 4px;
    height: 4px;
    background: ${STICK};
    border-radius: 50%;
  }

  .sb-eye-l { left: 9px; }
  .sb-eye-r { right: 9px; }

  .sb-mouth {
    position: absolute;
    bottom: 8px;
    left: 50%;
    width: 10px;
    height: 5px;
    margin-left: -5px;
    border-bottom: 2.5px solid ${STICK};
    border-radius: 0 0 10px 10px;
  }

  .sb-pose-run .sb-mouth,
  .sb-pose-throw-release .sb-mouth {
    width: 12px;
    height: 6px;
    border-radius: 0 0 12px 12px;
  }

  /* Torso */
  .sb-torso {
    position: absolute;
    top: 32px;
    left: 50%;
    width: 5px;
    height: 46px;
    margin-left: -2.5px;
    background: ${STICK};
    border-radius: 4px;
    transform-origin: top center;
  }

  .sb-joint {
    position: absolute;
    width: 7px;
    height: 7px;
    background: #fff;
    border: 2px solid ${STICK};
    border-radius: 50%;
    z-index: 2;
  }

  .sb-limb {
    position: absolute;
    background: ${STICK};
    border-radius: 3px;
    transform-origin: top center;
  }

  .sb-upper { width: 4px; height: 24px; }
  .sb-lower { width: 3.5px; height: 24px; top: 21px; transform-origin: top center; }

  .sb-hand, .sb-foot {
    position: absolute;
    bottom: -4px;
    left: 50%;
    width: 8px;
    height: 8px;
    margin-left: -4px;
    background: #fff;
    border: 2px solid ${STICK};
    border-radius: 50%;
  }

  /* Limbs — default positions */
  .sb-arm-b { left: -10px; top: 4px; transform: rotate(35deg); }
  .sb-arm-f { right: -10px; top: 4px; transform: rotate(-25deg); }
  .sb-leg-b { left: -5px; top: 42px; transform: rotate(12deg); }
  .sb-leg-f { right: -5px; top: 42px; transform: rotate(-8deg); }

  /* --- POSE: RUN --- */
  .sb-pose-run .sb-humanoid {
    animation: sb-run-bob 0.28s ease-in-out infinite;
  }

  .sb-pose-run .sb-torso {
    animation: sb-run-torso 0.28s ease-in-out infinite;
  }

  .sb-pose-run .sb-head {
    animation: sb-run-head 0.28s ease-in-out infinite;
  }

  .sb-pose-run .sb-arm-f {
    animation: sb-run-arm-f 0.56s ease-in-out infinite;
  }

  .sb-pose-run .sb-arm-f .sb-lower {
    animation: sb-run-forearm-f 0.56s ease-in-out infinite;
  }

  .sb-pose-run .sb-arm-b {
    animation: sb-run-arm-b 0.56s ease-in-out infinite;
  }

  .sb-pose-run .sb-arm-b .sb-lower {
    animation: sb-run-forearm-b 0.56s ease-in-out infinite;
  }

  .sb-pose-run .sb-leg-f {
    animation: sb-run-leg-f 0.56s ease-in-out infinite;
  }

  .sb-pose-run .sb-leg-f .sb-lower {
    animation: sb-run-shin-f 0.56s ease-in-out infinite;
  }

  .sb-pose-run .sb-leg-b {
    animation: sb-run-leg-b 0.56s ease-in-out infinite;
    filter: brightness(0.85);
  }

  .sb-pose-run .sb-leg-b .sb-lower {
    animation: sb-run-shin-b 0.56s ease-in-out infinite;
  }

  @keyframes sb-run-bob {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    25% { transform: translateY(-5px) rotate(-1deg); }
    50% { transform: translateY(0) rotate(0deg); }
    75% { transform: translateY(-3px) rotate(1deg); }
  }

  @keyframes sb-run-torso {
    0%, 100% { transform: rotate(8deg); }
    50% { transform: rotate(12deg); }
  }

  @keyframes sb-run-head {
    0%, 100% { transform: rotate(-4deg); }
    50% { transform: rotate(-8deg); }
  }

  @keyframes sb-run-arm-f {
    0% { transform: rotate(-55deg); }
    50% { transform: rotate(45deg); }
    100% { transform: rotate(-55deg); }
  }

  @keyframes sb-run-forearm-f {
    0% { transform: rotate(-20deg); }
    50% { transform: rotate(35deg); }
    100% { transform: rotate(-20deg); }
  }

  @keyframes sb-run-arm-b {
    0% { transform: rotate(50deg); }
    50% { transform: rotate(-40deg); }
    100% { transform: rotate(50deg); }
  }

  @keyframes sb-run-forearm-b {
    0% { transform: rotate(15deg); }
    50% { transform: rotate(-25deg); }
    100% { transform: rotate(15deg); }
  }

  @keyframes sb-run-leg-f {
    0% { transform: rotate(-35deg); }
    50% { transform: rotate(42deg); }
    100% { transform: rotate(-35deg); }
  }

  @keyframes sb-run-shin-f {
    0% { transform: rotate(15deg); }
    50% { transform: rotate(-55deg); }
    100% { transform: rotate(15deg); }
  }

  @keyframes sb-run-leg-b {
    0% { transform: rotate(38deg); }
    50% { transform: rotate(-30deg); }
    100% { transform: rotate(38deg); }
  }

  @keyframes sb-run-shin-b {
    0% { transform: rotate(-40deg); }
    50% { transform: rotate(20deg); }
    100% { transform: rotate(-40deg); }
  }

  /* --- POSE: DROP BOMB (arms raised) --- */
  .sb-pose-drop .sb-torso {
    transform: rotate(-4deg);
  }

  .sb-pose-drop .sb-arm-f {
    transform: rotate(-155deg);
    animation: sb-drop-arm 0.35s ease-in-out infinite alternate;
  }

  .sb-pose-drop .sb-arm-f .sb-lower {
    transform: rotate(-30deg);
  }

  .sb-pose-drop .sb-arm-b {
    transform: rotate(155deg);
  }

  .sb-pose-drop .sb-arm-b .sb-lower {
    transform: rotate(25deg);
  }

  @keyframes sb-drop-arm {
    from { transform: rotate(-150deg); }
    to { transform: rotate(-165deg); }
  }

  /* --- POSE: TOSS UP (from below) --- */
  .sb-pose-toss-up .sb-humanoid {
    transform: translateY(2px);
  }

  .sb-pose-toss-up .sb-torso {
    transform: rotate(-14deg);
  }

  .sb-pose-toss-up .sb-head {
    transform: rotate(10deg);
  }

  .sb-pose-toss-up .sb-arm-f {
    transform: rotate(-168deg);
    animation: sb-toss-up-arm 0.4s ease-in-out infinite alternate;
  }

  .sb-pose-toss-up .sb-arm-f .sb-lower {
    transform: rotate(-18deg);
  }

  .sb-pose-toss-up .sb-arm-b {
    transform: rotate(-145deg);
  }

  .sb-pose-toss-up .sb-arm-b .sb-lower {
    transform: rotate(-12deg);
  }

  .sb-pose-toss-up .sb-leg-b {
    transform: rotate(22deg);
  }

  .sb-pose-toss-up .sb-leg-f {
    transform: rotate(-18deg);
  }

  .sb-pose-toss-up .sb-hand-bomb {
    bottom: auto;
    top: -18px;
    left: 50%;
    margin-left: -12px;
    animation: sb-bomb-toss-hold 0.4s ease-in-out infinite alternate;
  }

  @keyframes sb-toss-up-arm {
    from { transform: rotate(-162deg); }
    to { transform: rotate(-175deg); }
  }

  @keyframes sb-bomb-toss-hold {
    from { transform: translateY(0) rotate(-6deg); }
    to { transform: translateY(-4px) rotate(6deg); }
  }

  /* --- POSE: THROW WIND-UP --- */
  .sb-pose-throw-windup .sb-humanoid {
    animation: sb-windup-pulse 0.35s ease-in-out infinite alternate;
  }

  .sb-pose-throw-windup .sb-torso {
    transform: rotate(-12deg);
  }

  .sb-pose-throw-windup .sb-head {
    transform: rotate(8deg);
  }

  .sb-pose-throw-windup .sb-arm-f {
    transform: rotate(-120deg);
    animation: sb-windup-arm 0.35s ease-in-out infinite alternate;
  }

  .sb-pose-throw-windup .sb-arm-f .sb-lower {
    transform: rotate(-45deg);
  }

  .sb-pose-throw-windup .sb-arm-b {
    transform: rotate(40deg);
  }

  .sb-pose-throw-windup .sb-leg-f {
    transform: rotate(-5deg);
  }

  .sb-pose-throw-windup .sb-leg-b {
    transform: rotate(18deg);
  }

  @keyframes sb-windup-pulse {
    from { transform: translateY(0); }
    to { transform: translateY(-2px); }
  }

  @keyframes sb-windup-arm {
    from { transform: rotate(-115deg); }
    to { transform: rotate(-130deg); }
  }

  /* --- POSE: THROW (release) --- */
  .sb-pose-throw-release .sb-humanoid {
    transform: rotate(6deg);
  }

  .sb-pose-throw-release .sb-torso {
    transform: rotate(18deg);
  }

  .sb-pose-throw-release .sb-head {
    transform: rotate(-6deg);
  }

  .sb-pose-throw-release .sb-arm-f {
    transform: rotate(55deg);
    animation: sb-throw-follow 0.45s ease-out forwards;
  }

  .sb-pose-throw-release .sb-arm-f .sb-lower {
    transform: rotate(25deg);
  }

  .sb-pose-throw-release .sb-arm-b {
    transform: rotate(-30deg);
  }

  .sb-pose-throw-release .sb-leg-b {
    transform: rotate(25deg);
  }

  .sb-pose-throw-release .sb-leg-f {
    transform: rotate(-20deg);
  }

  @keyframes sb-throw-follow {
    0% { transform: rotate(-20deg); }
    100% { transform: rotate(70deg); }
  }

  /* Bomb in hand */
  .sb-hand-bomb {
    position: absolute;
    bottom: -14px;
    left: 50%;
    margin-left: -12px;
    font-size: 22px;
    line-height: 1;
    filter: drop-shadow(1px 2px 2px rgba(0,0,0,0.25));
    animation: sb-bomb-hold 0.5s ease-in-out infinite alternate;
  }

  @keyframes sb-bomb-hold {
    from { transform: rotate(-8deg) translateY(0); }
    to { transform: rotate(8deg) translateY(-2px); }
  }
`;
