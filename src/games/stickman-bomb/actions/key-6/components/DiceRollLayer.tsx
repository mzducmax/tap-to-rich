/**
 * Layer for tumbling dice on the estate (key 6).
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import type { ActiveDiceRoll } from '../hooks/useDiceRoll';
import type { DiceLandPayload } from '../types';
import { DiceRollInstance } from './DiceRollInstance';
import { diceRollStyles } from '../styles/diceRollStyles';

type DiceRollLayerProps = {
  rolls: ActiveDiceRoll[];
  gameplayTargetRef: React.RefObject<HTMLElement | null>;
  onLand: (payload: DiceLandPayload) => void;
  onComplete: (rollId: number) => void;
};

export function DiceRollLayer({
  rolls,
  gameplayTargetRef,
  onLand,
  onComplete,
}: DiceRollLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null);

  if (rolls.length === 0) return null;

  return (
    <>
      <style>{diceRollStyles}</style>
      <div ref={layerRef} className="dice-roll-layer" aria-hidden>
        <div className="dice-roll-club-dim" aria-hidden />
        <div className="dice-roll-club-lights" aria-hidden>
          <div className="dice-roll-club-spot dice-roll-club-spot--magenta" />
          <div className="dice-roll-club-spot dice-roll-club-spot--cyan" />
          <div className="dice-roll-club-spot dice-roll-club-spot--violet" />
          <div className="dice-roll-club-spot dice-roll-club-spot--gold" />
          <div className="dice-roll-club-beam dice-roll-club-beam--left" />
          <div className="dice-roll-club-beam dice-roll-club-beam--right" />
        </div>
        <div className="dice-roll-club-follow-spot" aria-hidden />
        {rolls.map((roll) => (
          <DiceRollInstance
            key={roll.id}
            rollId={roll.id}
            multiplier={roll.multiplier}
            layerRef={layerRef}
            gameplayTargetRef={gameplayTargetRef}
            onLand={onLand}
            onComplete={() => onComplete(roll.id)}
          />
        ))}
      </div>
    </>
  );
}
