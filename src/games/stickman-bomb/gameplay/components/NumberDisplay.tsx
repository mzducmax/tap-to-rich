/**
 * Score counter display (hammer strike increments score).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence, type useAnimation } from 'motion/react';
import { BALANCE_DIGIT_HEIGHT, ClassicDigit } from './ClassicDigit';
import { counterStylesBalance } from '../styles/counterStylesBalance';
import { counterStylesClassic } from '../styles/counterStylesClassic';
import { counterStylesStick } from '../styles/counterStyles';
import { CounterDollarSign } from './CounterDollarSign';
import type { CounterDisplayStyle } from '../config/counterDisplayStyle';
import type { CounterToken } from '../logic/formatCounterDisplay';
import { StickDigit } from './StickDigit';
import { FloatingPenalty } from './FloatingPenalty';
import { FloatingSheepBonus } from '../sheep';
import { FloatingBirdBonus } from '../birds';
import type { PenaltyFloat, SheepBonusFloat, BirdBonusFloat } from '../types/gameplayTypes';

type NumberDisplayProps = {
  counterTokens: CounterToken[];
  controls: ReturnType<typeof useAnimation>;
  freezeSway: boolean;
  displayStyle?: CounterDisplayStyle;
  displayRef: React.RefObject<HTMLDivElement | null>;
  counterBoxRef: React.RefObject<HTMLDivElement | null>;
  penaltyFloats: PenaltyFloat[];
  onPenaltyFloatDone: (id: number) => void;
  sheepBonusFloats?: SheepBonusFloat[];
  onSheepBonusFloatDone?: (id: number) => void;
  birdBonusFloats?: BirdBonusFloat[];
  onBirdBonusFloatDone?: (id: number) => void;
  explosionOverlay?: React.ReactNode;
};

function getCounterStyles(style: CounterDisplayStyle) {
  if (style === 'stick') return counterStylesStick;
  if (style === 'balance') return counterStylesBalance;
  return counterStylesClassic;
}

function renderToken(
  token: CounterToken,
  index: number,
  isStick: boolean,
  isBalance: boolean,
) {
  if (token.type === 'group-gap') {
    return <span key={`gap-${index}`} className="digit-group-gap" aria-hidden />;
  }

  if (isStick) {
    return <StickDigit key={`digit-${index}`} value={token.value} />;
  }

  return (
    <ClassicDigit
      key={`digit-${index}`}
      value={token.value}
      cellHeight={isBalance ? BALANCE_DIGIT_HEIGHT : undefined}
    />
  );
}

export function NumberDisplay({
  counterTokens,
  controls,
  freezeSway,
  displayStyle = 'stick',
  displayRef,
  counterBoxRef,
  penaltyFloats,
  onPenaltyFloatDone,
  sheepBonusFloats = [],
  onSheepBonusFloatDone,
  birdBonusFloats = [],
  onBirdBonusFloatDone,
  explosionOverlay,
}: NumberDisplayProps) {
  const isStick = displayStyle === 'stick';
  const isBalance = displayStyle === 'balance';
  const floatClass = freezeSway ? '' : ' float-animation';

  return (
    <div ref={displayRef} className="relative">
      <style>{getCounterStyles(displayStyle)}</style>
      {!isBalance && explosionOverlay}
      <AnimatePresence>
        {birdBonusFloats.map((bonus) => (
          <FloatingBirdBonus
            key={`bird-bonus-${bonus.id}`}
            onComplete={() => onBirdBonusFloatDone?.(bonus.id)}
          />
        ))}
      </AnimatePresence>
      <AnimatePresence>
        {sheepBonusFloats.map((bonus) => (
          <FloatingSheepBonus
            key={`sheep-bonus-${bonus.id}`}
            onComplete={() => onSheepBonusFloatDone?.(bonus.id)}
          />
        ))}
      </AnimatePresence>
      <AnimatePresence>
        {penaltyFloats.map((penalty) => (
          <FloatingPenalty
            key={penalty.id}
            amount={penalty.amount}
            onComplete={() => onPenaltyFloatDone(penalty.id)}
          />
        ))}
      </AnimatePresence>
      <motion.div
        animate={controls}
        className={isBalance ? 'counter-scene-balance' : 'counter-scene'}
      >
        <div
          ref={counterBoxRef}
          id="counter-box"
          className={
            isBalance
              ? `balance-display${floatClass}`
              : `stick-ui-box${isStick ? '' : ' classic-ui-box'}${floatClass}`
          }
        >
          {isStick && (
            <>
              <span className="stick-joint stick-joint-tl" aria-hidden />
              <span className="stick-joint stick-joint-tr" aria-hidden />
              <span className="stick-joint stick-joint-bl" aria-hidden />
              <span className="stick-joint stick-joint-br" aria-hidden />
            </>
          )}
          <div className="digit-wrapper">
            {counterTokens.map((token, index) =>
              renderToken(token, index, isStick, isBalance),
            )}
            <CounterDollarSign style={displayStyle} />
          </div>
        </div>
        {!isBalance && (
          <div className={`ground-shadow${freezeSway ? '' : ' shadow-animation'}`} />
        )}
      </motion.div>
    </div>
  );
}
