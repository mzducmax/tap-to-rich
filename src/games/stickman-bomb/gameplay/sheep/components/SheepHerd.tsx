/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useMemo } from 'react';
import type { SheepDirection } from '../config/sheepConfig';
import { buildSheepFormation, type SheepSpawn } from '../logic/sheepFormation';
import { sheepStyles } from '../styles/sheepStyles';

type SheepUnitProps = {
  sheep: SheepSpawn;
  direction: SheepDirection;
  registerSheepRef: (id: number, node: HTMLDivElement | null) => void;
};

const SheepUnit = memo(function SheepUnit({ sheep, direction, registerSheepRef }: SheepUnitProps) {
  const fontSize = `${2.15 + sheep.scale * 1.1}rem`;
  const zIndex = Math.round(8 + sheep.depth * 18);
  const crossClass = [
    'sheep-unit',
    'sheep-unit-cross',
    direction === 'rtl' ? 'sheep-unit-cross-rtl' : '',
    sheep.isRear ? 'sheep-unit-rear' : '',
    sheep.variant === 'gold' ? 'sheep-unit-gold' : '',
    sheep.variant === 'pink' ? 'sheep-unit-pink' : '',
    sheep.variant === 'black' ? 'sheep-unit-black' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={(node) => registerSheepRef(sheep.id, node)}
      className={crossClass}
      data-sheep-variant={sheep.variant}
      style={{
        top: `${sheep.topPercent}%`,
        zIndex,
        ['--cross-ms' as string]: `${sheep.durationMs}ms`,
        ['--cross-delay' as string]: `${sheep.delayMs}ms`,
        ['--bob-ms' as string]: `${sheep.bobDurationMs}ms`,
        ['--shadow-scale' as string]: String(0.85 + sheep.scale * 0.25),
      }}
    >
      <span className="sheep-unit-shadow" aria-hidden />
      <span className="sheep-unit-body" style={{ fontSize }}>
        🐑
      </span>
    </div>
  );
});

type SheepHerdProps = {
  waveId: number;
  direction: SheepDirection;
  registerSheepRef: (id: number, node: HTMLDivElement | null) => void;
};

export function SheepHerd({ waveId, direction, registerSheepRef }: SheepHerdProps) {
  const flock = useMemo(() => buildSheepFormation(waveId), [waveId]);

  return (
    <div className="sheep-herd-layer" aria-hidden>
      <style>{sheepStyles}</style>
      <div key={waveId} className="sheep-flock">
        {flock.map((sheep) => (
          <SheepUnit
            key={sheep.id}
            sheep={sheep}
            direction={direction}
            registerSheepRef={registerSheepRef}
          />
        ))}
      </div>
    </div>
  );
}
