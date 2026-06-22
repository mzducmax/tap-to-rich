/**
 * Plinko overlay layer (key 2) — full-screen portal above App HUD.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { ActivePlinkoRound } from '../hooks/usePlinko';
import type { PlinkoLandPayload } from '../types';
import { PlinkoInstance } from './PlinkoInstance';
import { plinkoStyles } from '../styles/plinkoStyles';

type PlinkoLayerProps = {
  rounds: ActivePlinkoRound[];
  onLand: (payload: PlinkoLandPayload) => void;
  onComplete: (roundId: number) => void;
};

export function PlinkoLayer({ rounds, onLand, onComplete }: PlinkoLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (rounds.length === 0) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [rounds.length]);

  if (rounds.length === 0) return null;

  return createPortal(
    <>
      <style>{plinkoStyles}</style>
      <div ref={layerRef} className="plinko-layer" role="dialog" aria-modal="true" aria-label="Plinko">
        <div className="plinko-layer__dim" aria-hidden />
        <div className="plinko-layer__stage">
          {rounds.map((round) => (
            <PlinkoInstance
              key={round.id}
              roundId={round.id}
              layerRef={layerRef}
              onLand={onLand}
              onComplete={() => onComplete(round.id)}
            />
          ))}
        </div>
      </div>
    </>,
    document.body,
  );
}
