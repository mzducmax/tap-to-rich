/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';
import type { MoleSpawn } from '../logic/buildMoleField';
import { MoleSprite } from './MoleSprite';
import { moleStyles } from '../styles/moleStyles';
import type { MoleVisibility } from '../types/moleTypes';

type MoleUnitProps = {
  mole: MoleSpawn;
  visibility: MoleVisibility;
  registerMoleRef: (id: number, node: HTMLDivElement | null) => void;
};

const visibilityClass: Record<MoleVisibility, string> = {
  hidden: 'mole-unit-hidden',
  rising: 'mole-unit-rising',
  up: 'mole-unit-up',
  down: 'mole-unit-down',
  hit: 'mole-unit-hit',
};

const MoleUnit = memo(function MoleUnit({
  mole,
  visibility,
  registerMoleRef,
}: MoleUnitProps) {
  const stateClass = visibilityClass[visibility];

  return (
    <div
      className="mole-hole"
      style={{
        left: `${mole.leftPercent}%`,
        top: `${mole.topPercent}%`,
        ['--mole-scale' as string]: String(mole.scale),
        ['--mole-depth' as string]: String(Math.round(mole.scale * 10)),
      }}
    >
      <span className="mole-hole-shadow" aria-hidden />
      <div
        ref={(node) => registerMoleRef(mole.id, node)}
        className={`mole-unit ${stateClass}`}
        aria-hidden
      >
        <MoleSprite visibility={visibility} />
      </div>
    </div>
  );
});

type MoleFieldProps = {
  spawns: MoleSpawn[];
  visibility: Map<number, MoleVisibility>;
  registerMoleRef: (id: number, node: HTMLDivElement | null) => void;
};

export function MoleField({ spawns, visibility, registerMoleRef }: MoleFieldProps) {
  return (
    <div className="mole-field-layer" aria-hidden>
      <style>{moleStyles}</style>
      {spawns.map((mole) => (
        <MoleUnit
          key={mole.id}
          mole={mole}
          visibility={visibility.get(mole.id) ?? 'hidden'}
          registerMoleRef={registerMoleRef}
        />
      ))}
    </div>
  );
}

/** Small looping preview for settings / control hints. */
export function MoleControlPreview() {
  return (
    <div className="mole-control-preview" aria-hidden>
      <style>{moleStyles}</style>
      <div className="mole-hole">
        <MoleSprite visibility="hidden" loopPop />
      </div>
    </div>
  );
}
