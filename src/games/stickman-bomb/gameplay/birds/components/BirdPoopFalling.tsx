/**
 * Poop: vertical fall → splat stick on digit → slow drip down.
 * @license SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useEffect, useRef } from 'react';
import { birdPoopStyles } from '../styles/birdPoopStyles';
import type { BirdPoopDrop } from '../types/birdTypes';

type BirdPoopFallingProps = {
  poop: BirdPoopDrop;
};

export const BirdPoopFalling = memo(function BirdPoopFalling({
  poop,
}: BirdPoopFallingProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const blobWrapRef = useRef<HTMLDivElement>(null);
  const splatRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const stainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const blobWrap = blobWrapRef.current;
    const splat = splatRef.current;
    const trail = trailRef.current;
    const stain = stainRef.current;
    if (!root || !blobWrap) return;

    const { fromX, fromY, hitX, hitY, dripY } = poop;
    const trailH = Math.max(16, Math.round(dripY - hitY));
    const anims: Animation[] = [];

    anims.push(
      root.animate(
        [
          { transform: `translate3d(${fromX}px, ${fromY}px, 0)`, opacity: 1 },
          { transform: `translate3d(${hitX}px, ${hitY}px, 0)`, opacity: 1 },
        ],
        {
          duration: poop.fallMs,
          fill: 'forwards',
          easing: 'cubic-bezier(0.42, 0, 1, 1)',
        },
      ),
    );

    anims.push(
      root.animate(
        [
          { transform: `translate3d(${hitX}px, ${hitY}px, 0)`, opacity: 1 },
          { transform: `translate3d(${hitX}px, ${hitY + 3}px, 0)`, opacity: 1 },
          { transform: `translate3d(${hitX}px, ${dripY}px, 0)`, opacity: 0.08 },
        ],
        {
          duration: poop.stickMs + poop.dripMs,
          delay: poop.fallMs,
          fill: 'forwards',
          easing: 'cubic-bezier(0.25, 0, 0.75, 0.35)',
        },
      ),
    );

    anims.push(
      blobWrap.animate(
        [
          { transform: 'rotateX(0deg) scale(0.88, 1.05)' },
          { transform: 'rotateX(8deg) scale(0.95, 1.18)' },
        ],
        {
          duration: poop.fallMs,
          fill: 'forwards',
          easing: 'cubic-bezier(0.42, 0, 1, 1)',
        },
      ),
    );

    anims.push(
      blobWrap.animate(
        [
          { transform: 'rotateX(8deg) scale(0.95, 1.18)' },
          { transform: 'rotateX(72deg) scale(2.35, 0.52)' },
          { transform: 'rotateX(78deg) scale(2.1, 0.62)' },
          { transform: 'rotateX(82deg) scale(1.15, 1.55)' },
          { transform: 'rotateX(86deg) scale(0.7, 2.25)' },
        ],
        {
          duration: poop.stickMs + poop.dripMs,
          delay: poop.fallMs,
          fill: 'forwards',
          easing: 'linear',
        },
      ),
    );

    if (splat) {
      anims.push(
        splat.animate(
          [
            { opacity: 0, transform: 'scale(0.25)' },
            { opacity: 0.95, transform: 'scale(1.55)' },
            { opacity: 0.72, transform: 'scale(1.75)' },
          ],
          {
            duration: poop.stickMs + 280,
            delay: poop.fallMs - 40,
            fill: 'forwards',
            easing: 'cubic-bezier(0.2, 0.9, 0.3, 1)',
          },
        ),
      );
    }

    if (stain) {
      anims.push(
        stain.animate(
          [
            { opacity: 0, transform: 'scale(0.35)' },
            { opacity: 0.82, transform: 'scale(1.05)' },
            { opacity: 0.68, transform: 'scale(1.12)' },
          ],
          {
            duration: poop.stickMs + 360,
            delay: poop.fallMs,
            fill: 'forwards',
            easing: 'ease-out',
          },
        ),
      );
    }

    if (trail) {
      anims.push(
        trail.animate(
          [
            { height: '0px', opacity: 0 },
            { height: '9px', opacity: 0.9 },
            { height: `${trailH}px`, opacity: 0.22 },
          ],
          {
            duration: poop.dripMs,
            delay: poop.fallMs + poop.stickMs,
            fill: 'forwards',
            easing: 'ease-in',
          },
        ),
      );
    }

    return () => anims.forEach((a) => a.cancel());
  }, [poop]);

  return (
    <>
      <style>{birdPoopStyles}</style>
      <div className="bird-poop-sequence">
        <div
          ref={splatRef}
          className="bird-poop-impact-splat"
          style={{ left: poop.hitX, top: poop.hitY }}
        />
        <div
          ref={stainRef}
          className="bird-poop-stain"
          style={{ left: poop.hitX, top: poop.hitY }}
        />
        <div
          ref={rootRef}
          className="bird-poop-mover"
          style={{ transform: `translate3d(${poop.fromX}px, ${poop.fromY}px, 0)` }}
        >
          <div ref={blobWrapRef} className="bird-poop-blob-wrap">
            <div className="bird-poop-blob">
              <div ref={trailRef} className="bird-poop-trail" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
});
