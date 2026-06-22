/**
 * Plinko overlay styles (key 2).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import {
  PLINKO_BALL_SIZE,
  PLINKO_BOARD_H,
  PLINKO_BOARD_W,
  PLINKO_PEG_SIZE,
  PLINKO_PLAY_W,
  PLINKO_STATS_W,
  PLINKO_TOP_PADDING,
} from '../config/plinkoConfig';

export const PLINKO_LAYER_Z = 200;

export const plinkoStyles = `
  .plinko-layer {
    position: fixed;
    inset: 0;
    pointer-events: auto;
    overflow: hidden;
    z-index: ${PLINKO_LAYER_Z};
    display: flex;
    align-items: center;
    justify-content: center;
    isolation: isolate;
  }

  .plinko-layer__dim {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: rgba(0, 0, 0, 0.78);
    animation: plinko-dim-in 0.35s ease-out forwards;
  }

  .plinko-layer__stage {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 24px 16px;
    box-sizing: border-box;
    pointer-events: none;
  }

  .plinko-board-scaler {
    pointer-events: auto;
    margin: auto;
    transform: scale(min(1, calc((100vw - 32px) / ${PLINKO_PLAY_W}), calc((100vh - 48px) / ${PLINKO_BOARD_H})));
    transform-origin: center center;
  }

  .plinko-layer:has(.plinko-play-area--exiting) .plinko-layer__dim {
    animation: plinko-dim-out 300ms ease-in forwards;
  }

  .plinko-play-area {
    display: flex;
    align-items: stretch;
    gap: 12px;
    animation: plinko-board-in 0.42s cubic-bezier(0.22, 1.12, 0.36, 1) forwards;
    transform: scale(0.9);
    opacity: 0;
  }

  .plinko-play-area--exiting {
    animation: plinko-board-out 340ms ease-in forwards;
  }

  .plinko-board {
    position: relative;
    flex-shrink: 0;
    width: ${PLINKO_BOARD_W}px;
    height: ${PLINKO_BOARD_H}px;
    border-radius: 18px;
    background:
      linear-gradient(180deg, rgba(42, 47, 58, 0.99) 0%, rgba(22, 25, 32, 1) 100%);
    border: 2px solid rgba(255, 255, 255, 0.12);
    box-shadow:
      0 32px 96px rgba(0, 0, 0, 0.72),
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      inset 0 0 80px rgba(0, 0, 0, 0.25);
    touch-action: none;
  }

  .plinko-board::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: ${PLINKO_TOP_PADDING - 8}px;
    border-radius: 16px 16px 0 0;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.06) 0%,
      rgba(255, 255, 255, 0.02) 55%,
      transparent 100%
    );
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    pointer-events: none;
    z-index: 1;
  }

  .plinko-stats {
    flex-shrink: 0;
    width: ${PLINKO_STATS_W}px;
    height: ${PLINKO_BOARD_H}px;
    display: flex;
    flex-direction: column;
    border-radius: 14px;
    background: linear-gradient(180deg, rgba(30, 34, 44, 0.97) 0%, rgba(18, 20, 28, 0.99) 100%);
    border: 2px solid rgba(255, 255, 255, 0.1);
    box-shadow:
      0 24px 64px rgba(0, 0, 0, 0.55),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
    overflow: hidden;
    pointer-events: none;
  }

  .plinko-stats__title {
    flex-shrink: 0;
    padding: 10px 8px 8px;
    font-family: "Nunito", "Trebuchet MS", sans-serif;
    font-size: 0.72rem;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    text-align: center;
    color: rgba(253, 224, 71, 0.92);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .plinko-stats__rows {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 3px;
    padding: 0 6px 14px;
    box-sizing: border-box;
    min-height: 0;
  }

  .plinko-stats__row {
    flex-shrink: 0;
    height: 40px;
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1px;
    background: rgba(245, 158, 11, 0.14);
    border: 1px solid rgba(245, 158, 11, 0.22);
    transition: filter 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
  }

  .plinko-stats__row--edge {
    background: rgba(239, 68, 68, 0.16);
    border-color: rgba(239, 68, 68, 0.28);
  }

  .plinko-stats__row--center {
    background: rgba(107, 114, 128, 0.18);
    border-color: rgba(107, 114, 128, 0.28);
  }

  .plinko-stats__row--win {
    transform: scale(1.06);
    filter: brightness(1.2);
    box-shadow: 0 0 12px rgba(250, 204, 21, 0.55);
  }

  .plinko-stats__mult {
    font-family: "Arial Black", Arial, sans-serif;
    font-size: 0.52rem;
    font-weight: 900;
    color: #fde68a;
    line-height: 1.1;
  }

  .plinko-stats__row--edge .plinko-stats__mult {
    color: #fecaca;
  }

  .plinko-stats__row--center .plinko-stats__mult {
    color: #e5e7eb;
  }

  .plinko-stats__pct {
    font-family: "Nunito", "Trebuchet MS", sans-serif;
    font-size: 0.62rem;
    font-weight: 800;
    color: rgba(255, 255, 255, 0.82);
    line-height: 1.1;
    font-variant-numeric: tabular-nums;
  }

  .plinko-aim-zone {
    position: absolute;
    height: 72px;
    border-radius: 14px;
    border: 2px dashed rgba(250, 204, 21, 0.45);
    background: rgba(250, 204, 21, 0.08);
    cursor: grab;
    touch-action: none;
    z-index: 8;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    box-sizing: border-box;
    box-shadow: inset 0 0 24px rgba(250, 204, 21, 0.12);
  }

  .plinko-aim-zone--dragging {
    cursor: grabbing;
    border-color: rgba(250, 204, 21, 0.85);
    background: rgba(250, 204, 21, 0.16);
    box-shadow:
      inset 0 0 28px rgba(250, 204, 21, 0.2),
      0 0 20px rgba(250, 204, 21, 0.25);
  }

  .plinko-aim-zone__chev {
    font-size: 0.95rem;
    font-weight: 900;
    color: rgba(253, 224, 71, 0.75);
    pointer-events: none;
    user-select: none;
  }

  .plinko-aim-zone__label {
    font-family: "Arial Black", Arial, sans-serif;
    font-size: 0.72rem;
    font-weight: 900;
    letter-spacing: 0.22em;
    color: rgba(253, 224, 71, 0.9);
    pointer-events: none;
    user-select: none;
  }

  .plinko-drop-rail {
    position: absolute;
    height: 8px;
    border-radius: 999px;
    background: linear-gradient(
      90deg,
      rgba(251, 191, 36, 0.35) 0%,
      rgba(253, 224, 71, 0.95) 50%,
      rgba(251, 191, 36, 0.35) 100%
    );
    box-shadow:
      0 0 16px rgba(251, 191, 36, 0.55),
      0 2px 6px rgba(0, 0, 0, 0.35);
    pointer-events: none;
    z-index: 3;
  }

  .plinko-board__drop-ring {
    position: absolute;
    width: ${PLINKO_BALL_SIZE + 16}px;
    height: ${PLINKO_BALL_SIZE + 16}px;
    margin-left: -${(PLINKO_BALL_SIZE + 16) / 2}px;
    margin-top: -${(PLINKO_BALL_SIZE + 16) / 2}px;
    border-radius: 999px;
    border: 2px solid rgba(255, 255, 255, 0.28);
    box-shadow: 0 0 14px rgba(255, 255, 255, 0.12);
    pointer-events: none;
    z-index: 6;
    transition: left 0.04s linear;
  }

  .plinko-board__drop-ring--active {
    border-color: rgba(250, 204, 21, 0.7);
    box-shadow: 0 0 22px rgba(250, 204, 21, 0.45);
  }

  .plinko-peg {
    position: absolute;
    width: ${PLINKO_PEG_SIZE}px;
    height: ${PLINKO_PEG_SIZE}px;
    margin-left: -${PLINKO_PEG_SIZE / 2}px;
    margin-top: -${PLINKO_PEG_SIZE / 2}px;
    border-radius: 999px;
    background: radial-gradient(circle at 35% 30%, #ffffff 0%, #d1d5db 55%, #9ca3af 100%);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
    pointer-events: none;
    transition: transform 0.08s ease-out, box-shadow 0.08s ease-out, filter 0.08s ease-out;
  }

  .plinko-peg--hit {
    transform: scale(1.45);
    filter: brightness(1.55);
    box-shadow:
      0 0 16px rgba(253, 224, 71, 0.95),
      0 0 6px rgba(255, 255, 255, 0.9);
  }

  .plinko-ball {
    position: absolute;
    width: ${PLINKO_BALL_SIZE}px;
    height: ${PLINKO_BALL_SIZE}px;
    margin-left: -${PLINKO_BALL_SIZE / 2}px;
    margin-top: -${PLINKO_BALL_SIZE / 2}px;
    border-radius: 999px;
    background: radial-gradient(circle at 32% 28%, #fff7cc 0%, #fbbf24 42%, #d97706 100%);
    box-shadow:
      0 0 16px rgba(251, 191, 36, 0.7),
      0 2px 8px rgba(0, 0, 0, 0.48);
    z-index: 7;
    will-change: left, top, transform;
    pointer-events: none;
  }

  .plinko-ball--aim {
    width: ${PLINKO_BALL_SIZE + 8}px;
    height: ${PLINKO_BALL_SIZE + 8}px;
    margin-left: -${(PLINKO_BALL_SIZE + 8) / 2}px;
    margin-top: -${(PLINKO_BALL_SIZE + 8) / 2}px;
  }

  .plinko-ball--dragging {
    transform: scale(1.15);
    box-shadow:
      0 0 26px rgba(251, 191, 36, 0.95),
      0 4px 12px rgba(0, 0, 0, 0.5);
  }

  .plinko-slots {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 14px;
    display: flex;
    justify-content: center;
    gap: 3px;
    padding: 0 12px;
    pointer-events: none;
  }

  .plinko-slot {
    flex: 1;
    min-width: 0;
    max-width: 34px;
    height: 40px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: "Arial Black", Arial, sans-serif;
    font-size: 0.58rem;
    font-weight: 900;
    color: #fef3c7;
    text-shadow: 0 1px 0 rgba(0, 0, 0, 0.65);
    background: linear-gradient(180deg, #f59e0b 0%, #b45309 100%);
    border: 1px solid rgba(255, 255, 255, 0.18);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22);
    transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
  }

  .plinko-slot--edge {
    background: linear-gradient(180deg, #ef4444 0%, #991b1b 100%);
    color: #fff;
  }

  .plinko-slot--center {
    background: linear-gradient(180deg, #6b7280 0%, #374151 100%);
    color: #e5e7eb;
  }

  .plinko-slot--win {
    transform: scale(1.14) translateY(-3px);
    filter: brightness(1.25);
    box-shadow:
      0 0 18px rgba(250, 204, 21, 0.85),
      inset 0 1px 0 rgba(255, 255, 255, 0.35);
    z-index: 2;
  }

  .plinko-reward-burst {
    position: absolute;
    transform: translate(-50%, -100%);
    font-family: "Arial Black", Arial, sans-serif;
    font-size: 2.35rem;
    font-weight: 900;
    color: #fde047;
    text-shadow:
      0 0 16px rgba(250, 204, 21, 0.85),
      0 3px 0 #000,
      0 6px 14px rgba(0, 0, 0, 0.55);
    white-space: nowrap;
    animation: plinko-reward-pop 0.55s cubic-bezier(0.22, 1.2, 0.36, 1) forwards;
    z-index: 6;
    pointer-events: none;
  }

  @keyframes plinko-dim-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes plinko-dim-out {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  @keyframes plinko-board-in {
    from { opacity: 0; transform: scale(0.9) translateY(14px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }

  @keyframes plinko-board-out {
    from { opacity: 1; transform: scale(1); }
    to { opacity: 0; transform: scale(0.94) translateY(8px); }
  }

  @keyframes plinko-reward-pop {
    0% { opacity: 0; transform: translate(-50%, -100%) scale(0.5); }
    55% { opacity: 1; transform: translate(-50%, -100%) scale(1.12); }
    100% { opacity: 1; transform: translate(-50%, -100%) scale(1); }
  }
`;
