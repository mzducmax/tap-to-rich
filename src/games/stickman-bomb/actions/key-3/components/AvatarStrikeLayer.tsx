/**
 * Compositor layer for key [3] grappling hooks.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { useLayoutEffect, useRef } from 'react';
import type { ActiveAvatarStrike } from '../hooks/useAvatarStrike';
import { GrappleHookInstance } from './GrappleHookInstance';
import { grappleHookStyles } from '../styles/grappleHookStyles';
import jokerGif from '../../../../../assets/the dark knight joker GIF.gif';

type AvatarStrikeLayerProps = {
  strikes: ActiveAvatarStrike[];
  /** Kept for API compatibility — the hook no longer uses an avatar portrait. */
  avatarUrl?: string;
  gameplayTargetRef: React.RefObject<HTMLElement | null>;
  /** Fires when a hook starts hauling cash up — host docks balance + plays sound. */
  onArrowHit: () => void;
  onComplete: (strikeId: number) => void;
};

export function AvatarStrikeLayer({
  strikes,
  gameplayTargetRef,
  onArrowHit,
  onComplete,
}: AvatarStrikeLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const hasStrikes = strikes.length > 0;

  // Punch a transparent hole in the purple backdrop right over the house so
  // the estate stays fully visible while everything around it turns #9999cc.
  useLayoutEffect(() => {
    if (!hasStrikes) return;
    const layer = layerRef.current;
    const estate = gameplayTargetRef.current;
    if (!layer || !estate) return;
    const layerRect = layer.getBoundingClientRect();
    const estateRect = estate.getBoundingClientRect();
    const cx = estateRect.left - layerRect.left + estateRect.width / 2;
    const cy = estateRect.top - layerRect.top + estateRect.height / 2;
    const r = Math.max(estateRect.width, estateRect.height) * 0.75;
    layer.style.setProperty('--joker-hole-x', `${cx}px`);
    layer.style.setProperty('--joker-hole-y', `${cy}px`);
    layer.style.setProperty('--joker-hole-r', `${r}px`);
  }, [hasStrikes, gameplayTargetRef]);

  if (!hasStrikes) return null;

  return (
    <>
      <style>{grappleHookStyles}</style>
      <div ref={layerRef} className="grapple-layer" aria-hidden>
        <div className="grapple-joker-backdrop" />
        <div className="grapple-joker-gif">
          <img src={jokerGif} alt="" />
        </div>
        {strikes.map((strike) => (
          <GrappleHookInstance
            key={strike.id}
            strikeId={strike.id}
            layerRef={layerRef}
            gameplayTargetRef={gameplayTargetRef}
            onGrab={onArrowHit}
            onComplete={() => onComplete(strike.id)}
          />
        ))}
      </div>
    </>
  );
}
