/**
 * Score counter display — left dock, separate from gameplay target.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence, type useAnimation } from 'motion/react';
import { BALANCE_DIGIT_HEIGHT, ClassicDigit } from './ClassicDigit';
import { counterStylesBalance } from '../styles/counterStylesBalance';
import { counterStylesClassic } from '../styles/counterStylesClassic';
import { counterStylesStick } from '../styles/counterStyles';
import { scoreDisplaySceneStyles } from '../styles/scoreDisplayScene';
import { CounterDollarSign } from './CounterDollarSign';
import type { CounterDisplayStyle } from '../config/counterDisplayStyle';
import type { CounterToken } from '../logic/formatCounterDisplay';
import { formatCounterLabel } from '../logic/formatCounterDisplay';
import { StickDigit } from './StickDigit';
import { StickMinusSign } from './StickMinusSign';
import { FloatingSheepBonus } from '../sheep';
import { FloatingBirdBonus } from '../birds';
import { FloatingMoleBonus } from '../moles';
import type {
  SheepBonusFloat,
  BirdBonusFloat,
  MoleBonusFloat,
} from '../types/gameplayTypes';

type NumberDisplayProps = {
  score: number;
  counterTokens: CounterToken[];
  controls: ReturnType<typeof useAnimation>;
  freezeSway: boolean;
  displayStyle?: CounterDisplayStyle;
  displayRef: React.RefObject<HTMLDivElement | null>;
  sheepBonusFloats?: SheepBonusFloat[];
  onSheepBonusFloatDone?: (id: number) => void;
  birdBonusFloats?: BirdBonusFloat[];
  onBirdBonusFloatDone?: (id: number) => void;
  moleBonusFloats?: MoleBonusFloat[];
  onMoleBonusFloatDone?: (id: number) => void;
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

  if (token.type === 'sign') {
    if (isStick) {
      return <StickMinusSign key={`sign-${index}`} />;
    }
    return (
      <span key={`sign-${index}`} className="digit-sign" aria-hidden>
        -
      </span>
    );
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
  score,
  counterTokens,
  controls,
  freezeSway,
  displayStyle = 'stick',
  displayRef,
  sheepBonusFloats = [],
  onSheepBonusFloatDone,
  birdBonusFloats = [],
  onBirdBonusFloatDone,
  moleBonusFloats = [],
  onMoleBonusFloatDone,
}: NumberDisplayProps) {
  const isStick = displayStyle === 'stick';
  const isBalance = displayStyle === 'balance';
  const floatClass = freezeSway ? '' : ' float-animation';

  return (
    <div ref={displayRef} className="score-display-root">
      <style>{scoreDisplaySceneStyles}</style>
      <style>{getCounterStyles(displayStyle)}</style>
      <AnimatePresence>
        {moleBonusFloats.map((bonus) => (
          <FloatingMoleBonus
            key={`mole-bonus-${bonus.id}`}
            onComplete={() => onMoleBonusFloatDone?.(bonus.id)}
          />
        ))}
      </AnimatePresence>
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
            variant={bonus.variant}
            onComplete={() => onSheepBonusFloatDone?.(bonus.id)}
          />
        ))}
      </AnimatePresence>
      <motion.div
        animate={controls}
        className={isBalance ? 'counter-scene-balance' : 'counter-scene'}
      >
        <div
          id="score-display-box"
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
          <div
            className="digit-wrapper"
            aria-label={formatCounterLabel(score)}
            aria-live="polite"
          >
            {counterTokens.map((token, index) =>
              renderToken(token, index, isStick, isBalance),
            )}
            <CounterDollarSign style={displayStyle} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
