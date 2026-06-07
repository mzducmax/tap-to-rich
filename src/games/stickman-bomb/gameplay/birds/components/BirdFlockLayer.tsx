/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { AnimatePresence } from 'motion/react';
import { SPLAT_FADE_MS, SPLAT_LIFETIME_MS } from '../config/birdConfig';
import { buildBirdFlock } from '../logic/buildBirdFlock';
import { birdStyles } from '../styles/birdStyles';
import type { BirdPoopDrop, BirdPoopPenaltyFloat, BirdSplatMark } from '../types/birdTypes';
import { BirdPoopFalling } from './BirdPoopFalling';
import { BirdSplat } from './BirdSplat';
import { FloatingBirdPoopPenalty } from './FloatingBirdPoopPenalty';
import { PigeonBird } from './PigeonBird';

type BirdFlockLayerProps = {
  waveId: number;
  fallingPoops: readonly BirdPoopDrop[];
  splats: readonly BirdSplatMark[];
  poopPenaltyFloats: readonly BirdPoopPenaltyFloat[];
  onPoopPenaltyFloatDone: (id: number) => void;
  registerBirdRef: (id: number, node: HTMLDivElement | null) => void;
};

export function BirdFlockLayer({
  waveId,
  fallingPoops,
  splats,
  poopPenaltyFloats,
  onPoopPenaltyFloatDone,
  registerBirdRef,
}: BirdFlockLayerProps) {
  const flock = useMemo(() => buildBirdFlock(waveId), [waveId]);

  return (
    <div className="bird-flock-layer" aria-hidden>
      <style>{birdStyles}</style>

      <div key={waveId}>
        {flock.map((bird) => (
          <PigeonBird
            key={bird.id}
            bird={bird}
            registerBirdRef={registerBirdRef}
          />
        ))}
      </div>

      {fallingPoops.map((poop) => (
        <BirdPoopFalling key={`poop-${poop.id}`} poop={poop} />
      ))}

      {splats.map((splat) => (
        <div
          key={`splat-wrap-${splat.id}`}
          style={{
            ['--splat-hold-ms' as string]: `${SPLAT_LIFETIME_MS - SPLAT_FADE_MS}ms`,
            ['--splat-fade-ms' as string]: `${SPLAT_FADE_MS}ms`,
          }}
        >
          <BirdSplat
            x={splat.x}
            y={splat.y}
            seed={splat.seed}
            scale={splat.scale}
          />
        </div>
      ))}

      <AnimatePresence>
        {poopPenaltyFloats.map((penalty) => (
          <div
            key={`poop-penalty-${penalty.id}`}
            className="bird-poop-penalty-anchor"
            style={{
              transform: `translate3d(${penalty.x}px, ${penalty.y}px, 0) translate(-50%, -85%)`,
            }}
          >
            <FloatingBirdPoopPenalty
              onComplete={() => onPoopPenaltyFloatDone(penalty.id)}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
