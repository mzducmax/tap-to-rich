/**
 * Dice roll layer styles (key 6).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import { DICE_HALF, DICE_SIZE } from '../config/diceRollConfig';

const PIP_SIZE = Math.round(DICE_SIZE * 0.11);
const FACE_RADIUS = Math.round(DICE_SIZE * 0.11);
const FACE_PADDING = Math.round(DICE_SIZE * 0.08);

export const diceRollStyles = `
  .dice-roll-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 37;
    contain: layout style;
    perspective: 1100px;
    isolation: isolate;
  }

  .dice-roll-club-dim {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    opacity: 0;
    background:
      radial-gradient(
        ellipse 85% 72% at 50% 42%,
        rgba(8, 4, 18, 0.42) 0%,
        rgba(4, 2, 12, 0.78) 48%,
        rgba(0, 0, 0, 0.92) 100%
      ),
      linear-gradient(
        180deg,
        rgba(2, 0, 8, 0.88) 0%,
        rgba(6, 2, 16, 0.82) 45%,
        rgba(0, 0, 0, 0.9) 100%
      );
    animation: dice-club-dim-in 0.55s ease-out forwards;
    will-change: opacity;
  }

  .dice-roll-club-lights {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    overflow: hidden;
    mix-blend-mode: screen;
    opacity: 0;
    animation: dice-club-lights-in 0.7s ease-out 0.12s forwards;
  }

  .dice-roll-club-spot {
    position: absolute;
    border-radius: 999px;
    filter: blur(28px);
    opacity: 0.72;
    will-change: transform, opacity;
  }

  .dice-roll-club-spot--magenta {
    left: -8%;
    top: 8%;
    width: 46%;
    height: 38%;
    background: radial-gradient(circle, rgba(255, 0, 180, 0.95) 0%, rgba(236, 72, 153, 0.45) 42%, transparent 72%);
    animation: dice-club-spot-drift-a 2.8s ease-in-out infinite alternate;
  }

  .dice-roll-club-spot--cyan {
    right: -6%;
    top: 18%;
    width: 42%;
    height: 34%;
    background: radial-gradient(circle, rgba(0, 255, 255, 0.9) 0%, rgba(34, 211, 238, 0.42) 44%, transparent 74%);
    animation: dice-club-spot-drift-b 3.1s ease-in-out infinite alternate;
  }

  .dice-roll-club-spot--violet {
    left: 28%;
    bottom: -4%;
    width: 52%;
    height: 40%;
    background: radial-gradient(circle, rgba(168, 85, 247, 0.92) 0%, rgba(124, 58, 237, 0.38) 46%, transparent 76%);
    animation: dice-club-spot-drift-c 2.5s ease-in-out infinite alternate;
  }

  .dice-roll-club-spot--gold {
    left: 38%;
    top: -6%;
    width: 34%;
    height: 30%;
    background: radial-gradient(circle, rgba(253, 224, 71, 0.88) 0%, rgba(245, 158, 11, 0.34) 48%, transparent 78%);
    animation: dice-club-spot-drift-d 3.4s ease-in-out infinite alternate;
  }

  .dice-roll-club-beam {
    position: absolute;
    top: -18%;
    width: 18%;
    height: 135%;
    transform-origin: 50% 0%;
    opacity: 0.38;
    filter: blur(10px);
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.55) 0%,
      rgba(236, 72, 153, 0.42) 28%,
      rgba(168, 85, 247, 0.28) 58%,
      transparent 100%
    );
    clip-path: polygon(42% 0%, 58% 0%, 100% 100%, 0% 100%);
  }

  .dice-roll-club-beam--left {
    left: 14%;
    animation: dice-club-beam-sweep-left 3.6s ease-in-out infinite;
  }

  .dice-roll-club-beam--right {
    right: 12%;
    animation: dice-club-beam-sweep-right 4.1s ease-in-out infinite;
  }

  .dice-roll-club-follow-spot {
    position: absolute;
    left: var(--dice-spot-x, 50%);
    top: var(--dice-spot-y, 50%);
    z-index: 2;
    width: 320px;
    height: 320px;
    margin: -160px 0 0 -160px;
    pointer-events: none;
    border-radius: 999px;
    opacity: 0;
    background:
      radial-gradient(
        circle,
        rgba(255, 255, 255, 0.42) 0%,
        rgba(250, 204, 21, 0.28) 22%,
        rgba(236, 72, 153, 0.18) 44%,
        transparent 72%
      );
    filter: blur(6px);
    mix-blend-mode: screen;
    animation: dice-club-follow-pulse 1.05s ease-in-out infinite alternate;
    will-change: left, top, opacity;
  }

  .dice-roll-item {
    position: absolute;
    z-index: 5;
    width: ${DICE_SIZE}px;
    height: ${DICE_SIZE}px;
    margin-left: -${DICE_HALF}px;
    margin-top: -${DICE_HALF}px;
    transform-style: preserve-3d;
    will-change: transform, left, top;
    filter:
      drop-shadow(0 0 22px rgba(250, 204, 21, 0.55))
      drop-shadow(0 10px 18px rgba(15, 23, 42, 0.42));
  }

  @keyframes dice-club-dim-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes dice-club-lights-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes dice-club-spot-drift-a {
    from { transform: translate(0, 0) scale(1); opacity: 0.62; }
    to   { transform: translate(8%, 6%) scale(1.12); opacity: 0.88; }
  }

  @keyframes dice-club-spot-drift-b {
    from { transform: translate(0, 0) scale(1.05); opacity: 0.58; }
    to   { transform: translate(-7%, 5%) scale(0.94); opacity: 0.82; }
  }

  @keyframes dice-club-spot-drift-c {
    from { transform: translate(0, 0) scale(0.96); opacity: 0.64; }
    to   { transform: translate(5%, -6%) scale(1.08); opacity: 0.9; }
  }

  @keyframes dice-club-spot-drift-d {
    from { transform: translate(0, 0) scale(1); opacity: 0.5; }
    to   { transform: translate(-4%, 8%) scale(1.14); opacity: 0.78; }
  }

  @keyframes dice-club-beam-sweep-left {
    0%   { transform: rotate(-22deg); opacity: 0.22; }
    50%  { transform: rotate(18deg); opacity: 0.48; }
    100% { transform: rotate(-22deg); opacity: 0.22; }
  }

  @keyframes dice-club-beam-sweep-right {
    0%   { transform: rotate(20deg); opacity: 0.2; }
    50%  { transform: rotate(-16deg); opacity: 0.44; }
    100% { transform: rotate(20deg); opacity: 0.2; }
  }

  @keyframes dice-club-follow-pulse {
    from { opacity: 0.72; transform: scale(0.92); }
    to   { opacity: 1; transform: scale(1.06); }
  }

  .dice-roll-cube {
    position: relative;
    width: ${DICE_SIZE}px;
    height: ${DICE_SIZE}px;
    transform-style: preserve-3d;
    transform-origin: center center;
  }

  .dice-roll-face {
    position: absolute;
    inset: 0;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 3px;
    padding: ${FACE_PADDING}px;
    box-sizing: border-box;
    border-radius: ${FACE_RADIUS}px;
    background: linear-gradient(145deg, #fffef8 0%, #f3e8d8 55%, #e7d4bc 100%);
    border: 2px solid rgba(120, 53, 15, 0.48);
    backface-visibility: hidden;
    box-shadow: inset 0 2px 8px rgba(255, 255, 255, 0.55), inset 0 -4px 10px rgba(120, 53, 15, 0.12);
  }

  .dice-roll-pip {
    width: ${PIP_SIZE}px;
    height: ${PIP_SIZE}px;
    border-radius: 999px;
    background: radial-gradient(circle at 35% 30%, #4b5563 0%, #111827 70%);
    align-self: center;
    justify-self: center;
    opacity: 0;
  }

  .dice-roll-face-1 { transform: rotateY(0deg) translateZ(${DICE_HALF}px); }
  .dice-roll-face-6 { transform: rotateY(180deg) translateZ(${DICE_HALF}px); }
  .dice-roll-face-2 { transform: rotateY(90deg) translateZ(${DICE_HALF}px); }
  .dice-roll-face-5 { transform: rotateY(-90deg) translateZ(${DICE_HALF}px); }
  .dice-roll-face-3 { transform: rotateX(90deg) translateZ(${DICE_HALF}px); }
  .dice-roll-face-4 { transform: rotateX(-90deg) translateZ(${DICE_HALF}px); }

  .dice-roll-face-1 .dice-roll-pip:nth-child(5) { opacity: 1; }

  .dice-roll-face-2 .dice-roll-pip:nth-child(1),
  .dice-roll-face-2 .dice-roll-pip:nth-child(9) { opacity: 1; }

  .dice-roll-face-3 .dice-roll-pip:nth-child(1),
  .dice-roll-face-3 .dice-roll-pip:nth-child(5),
  .dice-roll-face-3 .dice-roll-pip:nth-child(9) { opacity: 1; }

  .dice-roll-face-4 .dice-roll-pip:nth-child(1),
  .dice-roll-face-4 .dice-roll-pip:nth-child(3),
  .dice-roll-face-4 .dice-roll-pip:nth-child(7),
  .dice-roll-face-4 .dice-roll-pip:nth-child(9) { opacity: 1; }

  .dice-roll-face-5 .dice-roll-pip:nth-child(1),
  .dice-roll-face-5 .dice-roll-pip:nth-child(3),
  .dice-roll-face-5 .dice-roll-pip:nth-child(5),
  .dice-roll-face-5 .dice-roll-pip:nth-child(7),
  .dice-roll-face-5 .dice-roll-pip:nth-child(9) { opacity: 1; }

  .dice-roll-face-6 .dice-roll-pip:nth-child(1),
  .dice-roll-face-6 .dice-roll-pip:nth-child(3),
  .dice-roll-face-6 .dice-roll-pip:nth-child(4),
  .dice-roll-face-6 .dice-roll-pip:nth-child(6),
  .dice-roll-face-6 .dice-roll-pip:nth-child(7),
  .dice-roll-face-6 .dice-roll-pip:nth-child(9) { opacity: 1; }

  .dice-roll-multiplier {
    position: absolute;
    left: 50%;
    top: -${Math.round(DICE_SIZE * 0.62)}px;
    transform: translateX(-50%);
    z-index: 2;
    font-family: "Arial Black", "Helvetica Neue", Arial, sans-serif;
    font-weight: 900;
    font-size: ${Math.round(DICE_SIZE * 0.34)}px;
    line-height: 1;
    letter-spacing: 0.02em;
    color: #fef08a;
    -webkit-text-stroke: 2px #713f12;
    paint-order: stroke fill;
    text-shadow:
      0 0 16px rgba(250, 204, 21, 0.95),
      0 0 28px rgba(251, 191, 36, 0.75),
      0 4px 10px rgba(0, 0, 0, 0.55);
    animation: dice-multiplier-pulse 0.85s ease-in-out infinite alternate;
    white-space: nowrap;
  }

  @keyframes dice-multiplier-pulse {
    from { transform: translateX(-50%) scale(0.92); filter: brightness(1); }
    to { transform: translateX(-50%) scale(1.08); filter: brightness(1.15); }
  }

  .dice-reward-burst {
    position: absolute;
    pointer-events: none;
    z-index: 45;
    width: 0;
    height: 0;
  }

  .dice-reward-burst-ring {
    position: absolute;
    left: 0;
    top: 0;
    width: 72px;
    height: 72px;
    margin: -36px 0 0 -36px;
    border-radius: 999px;
    border: 4px solid #fde047;
    background: rgba(253, 224, 71, 0.18);
  }

  .dice-reward-burst-flash {
    position: absolute;
    left: 0;
    top: 0;
    width: 88px;
    height: 88px;
    margin: -44px 0 0 -44px;
    border-radius: 999px;
    background: radial-gradient(circle, rgba(255, 251, 235, 0.95) 0%, rgba(251, 191, 36, 0.55) 45%, transparent 72%);
  }

  .dice-reward-burst-spark {
    position: absolute;
    left: 0;
    top: 0;
    transform: translate(-50%, -50%);
    user-select: none;
  }

  .dice-reward-burst-amount {
    position: absolute;
    left: 0;
    top: 0;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    font-family: "Arial Black", "Helvetica Neue", Arial, sans-serif;
    font-weight: 900;
    font-size: 2.35rem;
    color: #fde047;
    -webkit-text-stroke: 4px #000000;
    paint-order: stroke fill;
    text-shadow:
      0 0 18px rgba(250, 204, 21, 0.9),
      0 4px 0 #000,
      0 6px 14px rgba(0, 0, 0, 0.6);
    white-space: nowrap;
  }

  .dice-reward-burst-meta {
    font-size: 0.95rem;
    color: #fff7d6;
    -webkit-text-stroke: 2.5px #000000;
    letter-spacing: 0.06em;
  }

  .dice-reward-burst-result {
    position: absolute;
    left: 0;
    top: 0;
    transform: translate(-50%, -50%);
    font-family: "Arial Black", "Helvetica Neue", Arial, sans-serif;
    font-weight: 900;
    font-size: 1.6rem;
    color: #fff7d6;
    -webkit-text-stroke: 3px #000000;
    paint-order: stroke fill;
    letter-spacing: 0.04em;
    white-space: nowrap;
    text-shadow:
      0 0 16px rgba(250, 204, 21, 0.95),
      0 4px 0 #000,
      0 6px 16px rgba(0, 0, 0, 0.65);
  }
`;
