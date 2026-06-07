/**
 * Duck sprite bird — clipped viewport + sheet translate animation.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';
import { DuckSprite } from './DuckSprite';
import type { BirdSpawn } from '../logic/buildBirdFlock';

type PigeonBirdProps = {
  bird: BirdSpawn;
  registerBirdRef: (id: number, node: HTMLDivElement | null) => void;
};

export const PigeonBird = memo(function PigeonBird({ bird, registerBirdRef }: PigeonBirdProps) {
  return (
    <div
      ref={(node) => registerBirdRef(bird.id, node)}
      className="bird-pigeon-track bird-pigeon-cross"
      style={{
        ['--bird-top' as string]: `${bird.topPercent}%`,
        ['--bird-cross-ms' as string]: `${bird.durationMs}ms`,
        ['--bird-delay' as string]: `${bird.delayMs}ms`,
        ['--bird-scale' as string]: String(bird.scale),
      }}
      aria-hidden
    >
      <div className="bird-pigeon-drop">
        <div className="bird-pigeon">
          <DuckSprite startFrame={bird.startFrame} flapMs={bird.flapMs} />
        </div>
      </div>
    </div>
  );
});
