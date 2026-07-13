/**
 * One money-spinner round — wheel pops in, spins onto the winning money
 * tier, credits it, then fades out (key 5).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import type { ActiveMoneySpinner } from '../hooks/useMoneySpinner';
import {
  MONEY_SPINNER_FADE_MS,
  MONEY_SPINNER_INTRO_MS,
  MONEY_SPINNER_RESULT_HOLD_MS,
  MONEY_SPINNER_SPIN_MS,
  MONEY_SPINNER_WHEEL_SIZE,
  SPINNER_SEGMENTS,
  SPINNER_SEGMENT_ANGLE,
} from '../config/moneySpinnerConfig';

const RIM_BULB_COUNT = 12;
const RIM_INSET = 14;

type MoneySpinnerInstanceProps = {
  spin: ActiveMoneySpinner;
  onWin: (amount: number) => void;
  onComplete: () => void;
};

/** "$100" for a win, "-$20" for a penalty. */
function formatSpinnerAmount(amount: number): string {
  return amount < 0 ? `-$${Math.abs(amount)}` : `$${amount}`;
}

/** Conic-gradient stops for the wedges, clockwise from the top pointer. */
function buildWheelGradient(): string {
  const stops = SPINNER_SEGMENTS.map((seg, i) => {
    const from = i * SPINNER_SEGMENT_ANGLE;
    const to = from + SPINNER_SEGMENT_ANGLE;
    return `${seg.color} ${from}deg ${to}deg`;
  });
  return `conic-gradient(from 0deg, ${stops.join(', ')})`;
}

export function MoneySpinnerInstance({ spin, onWin, onComplete }: MoneySpinnerInstanceProps) {
  const [rotation, setRotation] = useState(0);
  const [settled, setSettled] = useState(false);
  const [closing, setClosing] = useState(false);

  const winningSegment = SPINNER_SEGMENTS[spin.segmentIndex];

  // Winning wedge center must stop under the top pointer: unwind the wedge's
  // own angle, plus whole extra turns, plus a small jitter inside the wedge.
  const targetRotation = useMemo(() => {
    const wedgeCenter = spin.segmentIndex * SPINNER_SEGMENT_ANGLE + SPINNER_SEGMENT_ANGLE / 2;
    return spin.turns * 360 - wedgeCenter + spin.landJitter * (SPINNER_SEGMENT_ANGLE / 2);
  }, [spin.segmentIndex, spin.turns, spin.landJitter]);

  useEffect(() => {
    const settleAt = MONEY_SPINNER_INTRO_MS + MONEY_SPINNER_SPIN_MS;
    const disappearAt = settleAt + MONEY_SPINNER_RESULT_HOLD_MS + MONEY_SPINNER_FADE_MS;
    const timers = [
      window.setTimeout(() => setRotation(targetRotation), MONEY_SPINNER_INTRO_MS),
      // Wheel stops on the winning wedge — show the win banner, but hold off
      // crediting the money / floating number until the wheel has faded out.
      window.setTimeout(() => setSettled(true), settleAt),
      window.setTimeout(() => setClosing(true), settleAt + MONEY_SPINNER_RESULT_HOLD_MS),
      window.setTimeout(() => {
        // Spinner has fully disappeared — now credit the win and let the
        // "+amount" float rise from the house.
        onWin(winningSegment.amount);
        onComplete();
      }, disappearAt),
    ];
    return () => timers.forEach((t) => window.clearTimeout(t));
    // Fire-once round: everything is derived from the immutable spin payload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const labelRadius = MONEY_SPINNER_WHEEL_SIZE * 0.36;
  const rimCenter = MONEY_SPINNER_WHEEL_SIZE / 2 + RIM_INSET;
  const bulbRadius = MONEY_SPINNER_WHEEL_SIZE / 2 + 2;

  return (
    <div className={`money-spinner-stage${closing ? ' money-spinner-stage--closing' : ''}`}>
      <div className="money-spinner-dim" aria-hidden />
      <div className="money-spinner-root">
        <div className="money-spinner-rim" aria-hidden>
          {Array.from({ length: RIM_BULB_COUNT }, (_, i) => {
            const angle = (i / RIM_BULB_COUNT) * Math.PI * 2 - Math.PI / 2;
            return (
              <div
                key={i}
                className="money-spinner-rim-dot"
                style={{
                  left: rimCenter + Math.cos(angle) * bulbRadius - 4.5,
                  top: rimCenter + Math.sin(angle) * bulbRadius - 4.5,
                  animationDelay: `${(i % 3) * 150}ms`,
                }}
              />
            );
          })}
        </div>

        <div
          className="money-spinner-wheel"
          style={{
            background: buildWheelGradient(),
            transform: `rotate(${rotation}deg)`,
            transition:
              rotation === 0
                ? undefined
                : `transform ${MONEY_SPINNER_SPIN_MS}ms cubic-bezier(0.12, 0.62, 0.06, 1)`,
          }}
        >
          {SPINNER_SEGMENTS.map((seg, i) => {
            const angle = i * SPINNER_SEGMENT_ANGLE + SPINNER_SEGMENT_ANGLE / 2;
            return (
              <div
                key={i}
                className="money-spinner-label"
                style={{ transform: `rotate(${angle}deg) translateY(-${labelRadius}px)` }}
              >
                <span className="money-spinner-label-text" style={{ color: seg.textColor }}>
                  {formatSpinnerAmount(seg.amount)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="money-spinner-hub" aria-hidden>
          💰
        </div>
        <div className="money-spinner-pointer" aria-hidden />

        {settled && (
          <>
            <div
              className={`money-spinner-win-flash${
                winningSegment.amount < 0 ? ' money-spinner-win-flash--penalty' : ''
              }`}
              aria-hidden
            />
            <div
              className={`money-spinner-win-banner${
                winningSegment.amount < 0 ? ' money-spinner-win-banner--penalty' : ''
              }`}
            >
              {formatSpinnerAmount(winningSegment.amount)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
