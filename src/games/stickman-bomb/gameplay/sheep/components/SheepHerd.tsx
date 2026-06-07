/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useMemo } from 'react';
import { buildSheepFormation, type SheepSpawn } from '../logic/sheepFormation';
import { sheepStyles } from '../styles/sheepStyles';

type SheepUnitProps = {
  sheep: SheepSpawn;
  registerSheepRef: (id: number, node: HTMLDivElement | null) => void;
};

const SheepUnit = memo(function SheepUnit({ sheep, registerSheepRef }: SheepUnitProps) {
  const fontSize = `${2.15 + sheep.scale * 1.1}rem`;
  const zIndex = Math.round(10 + sheep.depth * 20);

  return (
    <div
      ref={(node) => registerSheepRef(sheep.id, node)}
      className="sheep-unit sheep-unit-cross"
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
  registerSheepRef: (id: number, node: HTMLDivElement | null) => void;
};

export function SheepHerd({ waveId, registerSheepRef }: SheepHerdProps) {
  const flock = useMemo(() => buildSheepFormation(waveId), [waveId]);

  return (
    <div className="sheep-herd-layer" aria-hidden>
      <style>{sheepStyles}</style>
      <div key={waveId} className="sheep-flock">
        {flock.map((sheep) => (
          <SheepUnit
            key={sheep.id}
            sheep={sheep}
            registerSheepRef={registerSheepRef}
          />
        ))}
      </div>
    </div>
  );
}
